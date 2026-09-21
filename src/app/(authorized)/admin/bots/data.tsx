import { ColumnDef } from '@tanstack/react-table';
import { EditIcon, MoreHorizontalIcon, SendIcon, TrashIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { BOT_NOTIFICATION_TYPE_LABELS } from '@/entities/bot-notification';
import { session } from '@/entities/session/session.state';
import { BotNotification } from '@/shared/sdk/bot-notifications/bot-notifications.schemas';
import { State } from '@/shared/sdk/api-model';
import { Button } from '@/shared/ui/atoms/button';
import { Popover } from '@/shared/ui/moleculas/popover';
import { botsPageState } from './state/bots-page.state';

export const columns: ColumnDef<BotNotification>[] = [
  {
    accessorKey: 'name',
    header: () => <div>Назва</div>,
    cell: ({ row }) => <div className="font-medium text-zinc-100">{row.original.name}</div>,
  },
  {
    accessorKey: 'type',
    header: () => <div>Тип</div>,
    cell: ({ row }) => (
      <div className="text-sm text-zinc-300">{BOT_NOTIFICATION_TYPE_LABELS[row.original.type]}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: () => <div>Статус</div>,
    cell: ({ row }) => (
      <div className={row.original.status === State.ACTIVE ? 'text-green-400' : 'text-zinc-500'}>
        {row.original.status === State.ACTIVE ? 'Увімкнено' : 'Вимкнено'}
      </div>
    ),
  },
  {
    id: 'channels',
    header: () => <div>Канали</div>,
    cell: ({ row }) => {
      const channels = [
        row.original.hasTelegram ? 'Telegram' : null,
        row.original.hasDiscord ? 'Discord' : null,
      ].filter(Boolean);
      return <div className="text-sm text-zinc-400">{channels.length ? channels.join(', ') : '—'}</div>;
    },
  },
  {
    accessorKey: 'url',
    header: () => <div>URL</div>,
    cell: ({ row }) => (
      <div className="max-w-xs truncate text-sm text-zinc-400" title={row.original.url ?? undefined}>
        {row.original.url || '—'}
      </div>
    ),
  },
  {
    id: 'actions',
    header: () => <div>Дії</div>,
    cell: observer(({ row }) => {
      const bot = row.original;
      const canManage = session.canManageBotNotifications;
      const canSend = session.canSendManualBotNotifications && bot.type === 'MANUAL';

      if (!canManage && !canSend) {
        return null;
      }

      return (
        <Popover
          className="flex w-fit flex-col gap-2"
          trigger={
            <Button size="icon" variant="secondary">
              <MoreHorizontalIcon className="size-4" />
            </Button>
          }>
          {canSend && (
            <Button
              size="sm"
              variant="secondary"
              align="left"
              onClick={() => botsPageState.manage.modal.open({ bot, mode: 'send' })}>
              <SendIcon className="size-4 text-lime-400" />
              Створити повідомлення
            </Button>
          )}
          {canManage && (
            <>
              <Button
                size="sm"
                variant="secondary"
                align="left"
                onClick={() => botsPageState.manage.modal.open({ bot, mode: 'manage' })}>
                <EditIcon className="size-4 text-yellow-500" />
                Редагувати
              </Button>
              <Button
                size="sm"
                variant="secondary"
                align="left"
                onClick={() => botsPageState.manage.modal.open({ bot, mode: 'delete' })}>
                <TrashIcon className="size-4 text-red-500" />
                Видалити
              </Button>
            </>
          )}
        </Popover>
      );
    }),
  },
];
