import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { CirclePauseIcon, CirclePlayIcon, EditIcon, KeyRoundIcon, MoreHorizontalIcon, TrashIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { SSO_SCOPES, sortScopes } from '@/entities/sso/scopes';
import { getClientDomain } from '@/entities/sso/client-domain';
import type { SsoAdminClient } from '@/shared/sdk/sso/sso.api';
import { Button } from '@/shared/ui/atoms/button';
import { Popover } from '@/shared/ui/moleculas/popover';
import { appsPageState } from './state/apps-page.state';

const shortClientId = (clientId: string) =>
  clientId.length > 14 ? `${clientId.slice(0, 8)}…${clientId.slice(-4)}` : clientId;

export const columns: ColumnDef<SsoAdminClient>[] = [
  {
    accessorKey: 'name',
    header: () => <div>Назва</div>,
    cell: ({ row }) => {
      const app = row.original;
      return (
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={app.disabled ? 'font-medium text-zinc-400' : 'font-medium text-zinc-100'}>{app.name}</span>
            {app.firstParty ? (
              <span className="rounded-full border border-lime-700 bg-lime-700/30 px-1.5 text-[10px] font-semibold tracking-[0.1em] text-lime-200 uppercase">
                Офіційний
              </span>
            ) : (
              <span className="rounded-full border border-white/20 bg-white/5 px-1.5 text-[10px] font-semibold tracking-[0.1em] text-zinc-300 uppercase">
                Сторонній
              </span>
            )}
          </div>
          <div className="text-xs text-zinc-400">{getClientDomain(app.redirectUris) ?? '—'}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'clientId',
    header: () => <div>Client ID</div>,
    cell: ({ row }) => (
      <code title={row.original.clientId} className="rounded bg-white/6 px-1.5 py-0.5 text-xs text-zinc-300">
        {shortClientId(row.original.clientId)}
      </code>
    ),
  },
  {
    accessorKey: 'allowedScopes',
    header: () => <div>Доступи</div>,
    cell: ({ row }) => (
      <div className="text-sm text-zinc-300">
        {sortScopes(row.original.allowedScopes)
          .map(scope => SSO_SCOPES[scope].short)
          .join(', ') || '—'}
      </div>
    ),
  },
  {
    accessorKey: 'disabled',
    header: () => <div>Статус</div>,
    cell: ({ row }) =>
      row.original.disabled ? (
        <span className="text-sm text-red-300">Вимкнено</span>
      ) : (
        <span className="text-sm text-green-300">Активний</span>
      ),
  },
  {
    accessorKey: 'createdAt',
    header: () => <div>Створено</div>,
    cell: ({ row }) => (
      <div className="text-sm text-zinc-400">
        {dayjs(row.original.createdAt).format('DD.MM.YYYY HH:mm')}
        {row.original.createdBy && <div>{row.original.createdBy.nickname}</div>}
      </div>
    ),
  },
  {
    id: 'actions',
    header: () => <div>Дії</div>,
    cell: observer(({ row }) => {
      const app = row.original;
      const open = (mode: 'manage' | 'rotate' | 'toggle' | 'delete') => appsPageState.manage.modal.open({ app, mode });

      return (
        <Popover
          className="flex w-fit flex-col gap-2"
          trigger={
            <Button size="icon" variant="secondary" aria-label={`Дії для ${app.name}`}>
              <MoreHorizontalIcon className="size-4" />
            </Button>
          }>
          <Button size="sm" variant="secondary" align="left" onClick={() => open('manage')}>
            <EditIcon className="size-4 text-yellow-500" />
            Редагувати
          </Button>
          {app.confidential && (
            <Button size="sm" variant="secondary" align="left" onClick={() => open('rotate')}>
              <KeyRoundIcon className="size-4 text-sky-400" />
              Згенерувати новий секрет
            </Button>
          )}
          <Button size="sm" variant="secondary" align="left" onClick={() => open('toggle')}>
            {app.disabled ? (
              <CirclePlayIcon className="size-4 text-green-400" />
            ) : (
              <CirclePauseIcon className="size-4 text-amber-500" />
            )}
            {app.disabled ? 'Увімкнути' : 'Вимкнути'}
          </Button>
          <Button size="sm" variant="secondary" align="left" className="text-red-300" onClick={() => open('delete')}>
            <TrashIcon className="size-4 text-red-500" />
            Видалити
          </Button>
        </Popover>
      );
    }),
  },
];
