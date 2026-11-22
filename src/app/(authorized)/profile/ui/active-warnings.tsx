'use client';

import { ActiveUserWarning } from '@/shared/sdk/types';
import dayjs from 'dayjs';
import { AlertTriangleIcon, LoaderIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { FC, useEffect, useMemo } from 'react';
import { ActiveWarningsState } from '../state/active-warnings.state';

const formatDate = (date?: string | null) => (date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '—');

const ActiveWarningItem: FC<{ warning: ActiveUserWarning }> = ({ warning }) => {
  const weight = warning.weight ?? 1;
  const text = warning.ruleText || (!warning.comment ? warning.reason : '');

  return (
    <div className="rounded-md border border-amber-400/20 bg-amber-400/[0.04] p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-amber-100">
          {warning.ruleNumber ? `Порушено правило ${warning.ruleNumber}` : 'Попередження'}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 rounded bg-amber-400/15 px-2 py-0.5 text-xs font-medium text-amber-100">
          <AlertTriangleIcon className="size-3.5" aria-hidden />
          {weight}
        </span>
      </div>
      <div className="mt-1 text-xs text-zinc-400">
        Видано {formatDate(warning.createdAt)} · діє до {formatDate(warning.expiresAt)}
      </div>
      {text && (
        <div className="mt-2 text-sm text-zinc-300">
          <span className="text-zinc-500">Текст: </span>
          <span className="whitespace-pre-wrap">{text}</span>
        </div>
      )}
      {warning.comment && (
        <div className="mt-1 text-sm text-zinc-300">
          <span className="text-zinc-500">Коментар: </span>
          <span className="whitespace-pre-wrap">{warning.comment}</span>
        </div>
      )}
    </div>
  );
};

export const ActiveWarningsSection: FC<{ userId?: string }> = observer(({ userId }) => {
  const model = useMemo(() => new ActiveWarningsState(), []);

  useEffect(() => {
    void model.load(userId);
  }, [model, userId]);

  const { count, limit, ban, items } = model.summary;
  const banLabel = !ban
    ? ''
    : ban.bannedUntil
      ? `бан${ban.days ? ` на ${ban.days} днів` : ''}, до ${formatDate(ban.bannedUntil)}`
      : 'перманентний бан';

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <AlertTriangleIcon className="size-4 text-amber-400" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
          Актуальні попередження
        </span>
      </div>

      {model.loader.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <LoaderIcon className="size-4 animate-spin" />
          Завантаження…
        </div>
      ) : items.length === 0 ? (
        <div className="text-sm text-zinc-500">Актуальних попереджень немає</div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="text-lg font-semibold text-white">
            {count}/{limit || 3}
            {banLabel ? <span className="ml-2 text-base font-medium text-red-300">{banLabel}</span> : null}
          </div>
          {items.map(warning => (
            <ActiveWarningItem key={warning.id} warning={warning} />
          ))}
        </div>
      )}
    </section>
  );
});
