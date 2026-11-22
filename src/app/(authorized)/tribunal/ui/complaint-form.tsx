'use client';

import { session } from '@/entities/session/session.state';
import { tribunalApi, usersApi } from '@/shared/sdk';
import { CreateTribunalComplaintDto, TribunalGameOption } from '@/shared/sdk/tribunal/tribunal.schemas';
import { User } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { Textarea } from '@/shared/ui/atoms/textarea';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const fieldClass =
  'flex h-9 w-full rounded-md border border-neutral-700 bg-black/70 px-2 text-sm text-zinc-100 focus-visible:border-lime-500 focus-visible:outline-none';

const errorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;

  if (Array.isArray(message)) return message[0] ?? fallback;
  if (typeof message === 'string') return message;

  return fallback;
};

type ComplaintFormProps = {
  onCreated: (id: string) => void;
  onCancel: () => void;
};

export const ComplaintForm = observer(({ onCreated, onCancel }: ComplaintFormProps) => {
  const canSetRule = session.canModerateUsers;
  const [games, setGames] = useState<TribunalGameOption[]>([]);
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<User[]>([]);
  const [target, setTarget] = useState<User | null>(null);
  const [ruleNumber, setRuleNumber] = useState('');
  const [ruleText, setRuleText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [violatedAt, setViolatedAt] = useState('');
  const [gameId, setGameId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    tribunalApi
      .findGames()
      .then(({ data }) => setGames(data))
      .catch(() => setGames([]));
  }, []);

  useEffect(() => {
    if (query.trim().length < 2 || target?.nickname === query) {
      setMatches([]);
      return;
    }

    const timeout = window.setTimeout(() => {
      usersApi
        .findUsers({ search: query.trim(), take: 8 })
        .then(({ data }) => setMatches(data.data ?? []))
        .catch(() => setMatches([]));
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [query, target?.nickname]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!target) {
      toast.error('Оберіть гравця');
      return;
    }

    const dto: CreateTribunalComplaintDto = {
      targetUserId: target.id,
      violatedAt: new Date(violatedAt).toISOString(),
      description: description.trim(),
      ...(gameId ? { gameId } : {}),
      ...(canSetRule && ruleNumber.trim() ? { ruleNumber: ruleNumber.trim(), ruleText: ruleText.trim() } : {}),
    };

    try {
      setSubmitting(true);
      const { data } = await tribunalApi.createComplaint(dto);

      if (files.length) {
        try {
          await tribunalApi.uploadAttachments(data.id, files);
        } catch (error) {
          toast.error(errorMessage(error, 'Скаргу подано, але файли не завантажились. Додайте їх на сторінці скарги'));
          onCreated(data.id);
          return;
        }
      }

      toast.success('Скаргу подано');
      onCreated(data.id);
    } catch (error) {
      toast.error(errorMessage(error, 'Не вдалося подати скаргу'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="relative">
        <Input
          label="Гравець"
          value={query}
          onChange={event => {
            setQuery(event.target.value);
            setTarget(null);
          }}
          required
        />
        {matches.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-white/10 bg-zinc-950">
            {matches.map(user => (
              <button
                key={user.id}
                type="button"
                className="block w-full px-3 py-2 text-left text-sm text-zinc-100 hover:bg-white/5"
                onClick={() => {
                  setTarget(user);
                  setQuery(user.nickname);
                  setMatches([]);
                }}>
                {user.nickname}
              </button>
            ))}
          </div>
        )}
      </div>

      {canSetRule && (
        <>
          <Input
            label="№ правила"
            value={ruleNumber}
            onChange={event => setRuleNumber(event.target.value)}
            maxLength={20}
          />
          <Textarea
            label="Текст правила"
            value={ruleText}
            onChange={event => setRuleText(event.target.value)}
            maxLength={1000}
          />
        </>
      )}

      <Input
        label="Дата порушення"
        type="datetime-local"
        value={violatedAt}
        onChange={event => setViolatedAt(event.target.value)}
        required
      />

      <label className="flex flex-col gap-1 text-xs text-zinc-400">
        Гра
        <select className={fieldClass} value={gameId} onChange={event => setGameId(event.target.value)}>
          <option value="">Без привʼязки до гри</option>
          {games.map(game => (
            <option key={game.id} value={game.id}>
              {dayjs(game.date).format('DD.MM.YYYY HH:mm')} — {game.missionName}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-zinc-400">
        Фото або відео
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          className="text-sm text-zinc-200 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-zinc-100"
          onChange={event => {
            const selected = Array.from(event.target.files ?? []).slice(0, 10);
            setFiles(selected);
          }}
        />
        {files.length > 0 && (
          <span className="text-zinc-500">{files.map(file => file.name).join(', ')}</span>
        )}
      </label>

      <Textarea
        label="Опис і доказ порушення"
        value={description}
        onChange={event => setDescription(event.target.value)}
        required
        minLength={10}
        maxLength={4000}
      />

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          Подати скаргу
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Скасувати
        </Button>
      </div>
    </form>
  );
});
