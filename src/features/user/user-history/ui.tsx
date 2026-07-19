'use client';

import { getUserRoleText } from '@/entities/user/lib';
import { UserNicknameText } from '@/entities/user/ui/user-text';
import { UserHistoryEvent, UserHistoryEventType, UserRole } from '@/shared/sdk/types';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
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

const historyTypeIconColors: Record<UserHistoryEventType, string> = {
  [UserHistoryEventType.SIGN_UP]: 'text-green-400',
  [UserHistoryEventType.SQUAD_JOIN]: 'text-blue-400',
  [UserHistoryEventType.SQUAD_LEAVE]: 'text-blue-400',
  [UserHistoryEventType.WARNING]: 'text-amber-400',
  [UserHistoryEventType.WARNING_REMOVED]: 'text-amber-400',
  [UserHistoryEventType.TEMP_BAN]: 'text-red-400',
  [UserHistoryEventType.PERMANENT_BAN]: 'text-red-400',
  [UserHistoryEventType.UNBAN]: 'text-red-400',
  [UserHistoryEventType.NICKNAME_CHANGE]: 'text-yellow-400',
  [UserHistoryEventType.ROLE_CHANGE]: 'text-yellow-400',
  [UserHistoryEventType.REVIEWER_CHANGE]: 'text-yellow-400',
};

const formatDate = (date?: string | null) => (date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '—');
const formatTime = (date?: string | null) => (date ? dayjs(date).format('HH:mm') : '—');

const groupEventsByDate = (events: UserHistoryEvent[]) => {
  const groups: { key: string; label: string; events: UserHistoryEvent[] }[] = [];

  events.forEach(event => {
    const date = event.createdAt ? dayjs(event.createdAt) : null;
    const key = date?.isValid() ? date.format('YYYY-MM-DD') : 'unknown';
    const existingGroup = groups.find(group => group.key === key);

    if (existingGroup) {
      existingGroup.events.push(event);
      return;
    }

    groups.push({
      key,
      label: date?.isValid() ? date.locale('uk').format('D MMMM YYYY') : 'Дата невідома',
      events: [event],
    });
  });

  return groups;
};

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
  const iconColor = historyTypeIconColors[event.type] ?? 'text-primary';
  const description = describeEvent(event);

  return (
    <div className="flex gap-3 py-3">
      <div className="z-10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-zinc-950">
        <Icon className={`size-4 ${iconColor}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium text-zinc-100">{historyTypeLabels[event.type]}</span>
          <time className="font-mono text-xs text-zinc-400" dateTime={event.createdAt ?? undefined}>
            {formatTime(event.createdAt)}
          </time>
        </div>
        {event.actor?.nickname && (
          <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-zinc-400">
            <span>Автор:</span>
            <UserNicknameText
              user={event.actor}
              tag={event.actor.squad?.tag}
              sideType={event.actor.squad?.side?.type}
            />
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
        <div className="rounded-md border border-white/10 bg-white/2 px-3 pb-2">
          {groupEventsByDate(model.events).map(group => (
            <div key={group.key}>
              <div className="flex items-center gap-3 pb-1 pt-4">
                <time className="shrink-0 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {group.label}
                </time>
                <div className="h-px w-full bg-white/10" />
              </div>
              <div className="relative">
                <div className="absolute bottom-3 left-[15px] top-3 w-px bg-white/10" aria-hidden />
                {group.events.map(event => (
                  <div key={event.id} className="relative">
                    <UserHistoryItem event={event} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
});
