'use client';

import { getUserRoleText } from '@/entities/user/lib';
import { UserHistoryEvent, UserHistoryEventType, UserRole } from '@/shared/sdk/types';
import dayjs from 'dayjs';
import {
  AlertTriangleIcon,
  BanIcon,
  ClipboardCheckIcon,
  LoaderIcon,
  LogOutIcon,
  PencilIcon,
  ScrollTextIcon,
  ShieldIcon,
  ShieldOffIcon,
  UserPlusIcon,
  UsersIcon,
} from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { FC, useEffect, useMemo } from 'react';
import { UserHistoryModel } from './model';

const historyTypeLabels: Record<UserHistoryEventType, string> = {
  [UserHistoryEventType.SIGN_UP]: 'Реєстрація',
  [UserHistoryEventType.SQUAD_JOIN]: 'Вступ до загону',
  [UserHistoryEventType.SQUAD_LEAVE]: 'Вихід із загону',
  [UserHistoryEventType.WARNING]: 'Попередження',
  [UserHistoryEventType.WARNING_REMOVED]: 'Попередження знято',
  [UserHistoryEventType.TEMP_BAN]: 'Тимчасовий бан',
  [UserHistoryEventType.PERMANENT_BAN]: 'Перманентний бан',
  [UserHistoryEventType.UNBAN]: 'Розбан',
  [UserHistoryEventType.NICKNAME_CHANGE]: 'Зміна нікнейму',
  [UserHistoryEventType.ROLE_CHANGE]: 'Зміна ролі',
  [UserHistoryEventType.REVIEWER_CHANGE]: 'Статус перевіряючого',
};

const historyTypeIcons: Record<UserHistoryEventType, FC<{ className?: string }>> = {
  [UserHistoryEventType.SIGN_UP]: UserPlusIcon,
  [UserHistoryEventType.SQUAD_JOIN]: UsersIcon,
  [UserHistoryEventType.SQUAD_LEAVE]: LogOutIcon,
  [UserHistoryEventType.WARNING]: AlertTriangleIcon,
  [UserHistoryEventType.WARNING_REMOVED]: ShieldOffIcon,
  [UserHistoryEventType.TEMP_BAN]: BanIcon,
  [UserHistoryEventType.PERMANENT_BAN]: BanIcon,
  [UserHistoryEventType.UNBAN]: ShieldOffIcon,
  [UserHistoryEventType.NICKNAME_CHANGE]: PencilIcon,
  [UserHistoryEventType.ROLE_CHANGE]: ShieldIcon,
  [UserHistoryEventType.REVIEWER_CHANGE]: ClipboardCheckIcon,
};

const formatDate = (date?: string | null) => (date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '—');

const describeEvent = (event: UserHistoryEvent) => {
  const payload = event.payload ?? {};

  switch (event.type) {
    case UserHistoryEventType.SIGN_UP:
      return '';
    case UserHistoryEventType.SQUAD_JOIN:
      return payload.squadTag ? `Приєднався до [${payload.squadTag}]` : 'Приєднався до загону';
    case UserHistoryEventType.SQUAD_LEAVE:
      return payload.squadTag ? `Покинув [${payload.squadTag}]` : 'Покинув загін';
    case UserHistoryEventType.NICKNAME_CHANGE:
      return `${payload.oldNickname ?? '—'} → ${payload.newNickname ?? '—'}`;
    case UserHistoryEventType.ROLE_CHANGE:
      return `${getUserRoleText(payload.oldRole as UserRole | undefined)} → ${getUserRoleText(payload.newRole as UserRole | undefined)}`;
    case UserHistoryEventType.REVIEWER_CHANGE:
      return payload.newValue ? 'Призначено перевіряючим місій' : 'Знято статус перевіряючого місій';
    case UserHistoryEventType.TEMP_BAN:
      return [
        payload.reason,
        payload.bannedUntil ? `до ${formatDate(payload.bannedUntil)}` : null,
        payload.isMuted ? 'мут увімкнено' : null,
      ]
        .filter(Boolean)
        .join(' · ');
    case UserHistoryEventType.PERMANENT_BAN:
    case UserHistoryEventType.WARNING:
    case UserHistoryEventType.WARNING_REMOVED:
    case UserHistoryEventType.UNBAN:
      return payload.reason ?? null;
    default:
      return null;
  }
};

const UserHistoryItem: FC<{ event: UserHistoryEvent }> = ({ event }) => {
  const Icon = historyTypeIcons[event.type] ?? ScrollTextIcon;
  const description = describeEvent(event);

  return (
    <div className="flex gap-3 py-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium text-zinc-100">{historyTypeLabels[event.type]}</span>
          <span className="text-xs text-zinc-400">{formatDate(event.createdAt)}</span>
        </div>
        {event.actor?.nickname && (
          <div className="mt-1 text-xs text-zinc-400">
            Автор: <span className="text-zinc-200">{event.actor.nickname}</span>
          </div>
        )}
        {description && <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-300">{description}</div>}
      </div>
    </div>
  );
};

export const UserHistorySection: FC<{ userId?: string }> = observer(({ userId }) => {
  const model = useMemo(() => new UserHistoryModel(), []);

  useEffect(() => {
    void model.load(userId);
  }, [model, userId]);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <ScrollTextIcon className="size-4 text-primary" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Історія користувача</span>
      </div>

      {model.loader.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <LoaderIcon className="size-4 animate-spin" />
          Завантаження…
        </div>
      ) : model.events.length === 0 ? (
        <div className="text-sm text-zinc-500">Подій поки немає</div>
      ) : (
        <div className="divide-y divide-white/10 rounded-md border border-white/10 bg-white/[0.02] px-3">
          {model.events.map(event => (
            <UserHistoryItem key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
});
