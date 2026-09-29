import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { EditIcon, MoreHorizontalIcon, TrashIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { UserNicknameText } from '@/entities/user/ui/user-text';
import { ApiKey } from '@/shared/sdk/api-keys/api-keys.schemas';
import { Button } from '@/shared/ui/atoms/button';
import { Popover } from '@/shared/ui/moleculas/popover';
import { apiKeysPageState } from './state/api-keys-page.state';

export const columns: ColumnDef<ApiKey>[] = [
  {
    accessorKey: 'name',
    header: () => <div>Назва</div>,
    cell: ({ row }) => <div className="font-medium text-zinc-100">{row.original.name}</div>,
  },
  {
    accessorKey: 'keyPrefix',
    header: () => <div>Префікс ключа</div>,
    cell: ({ row }) => (
      <code className="rounded bg-black/40 px-2 py-1 text-sm text-zinc-300">{row.original.keyPrefix}…</code>
    ),
  },
  {
    accessorKey: 'createdBy',
    header: () => <div>Створив</div>,
    cell: ({ row }) =>
      row.original.createdBy ? (
        <UserNicknameText user={row.original.createdBy} link className="text-sm" />
      ) : (
        <div className="text-sm text-zinc-400">—</div>
      ),
  },
  {
    accessorKey: 'lastUsedAt',
    header: () => <div>Останнє використання</div>,
    cell: ({ row }) => (
      <div className="text-sm text-zinc-400">
        {row.original.lastUsedAt ? dayjs(row.original.lastUsedAt).format('DD.MM.YYYY HH:mm') : '—'}
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: () => <div>Створено</div>,
    cell: ({ row }) => (
      <div className="text-sm text-zinc-400">{dayjs(row.original.createdAt).format('DD.MM.YYYY HH:mm')}</div>
    ),
  },
  {
    id: 'actions',
    header: () => <div>Дії</div>,
    cell: observer(({ row }) => (
      <Popover
        className="flex w-fit flex-col gap-2"
        trigger={
          <Button size="icon" variant="secondary">
            <MoreHorizontalIcon className="size-4" />
          </Button>
        }>
        <Button
          size="sm"
          variant="secondary"
          align="left"
          onClick={() =>
            apiKeysPageState.manage.modal.open({
              apiKey: row.original,
              mode: 'manage',
            })
          }>
          <EditIcon className="size-4 text-yellow-500" />
          Редагувати назву
        </Button>
        <Button
          size="sm"
          variant="secondary"
          align="left"
          onClick={() =>
            apiKeysPageState.manage.modal.open({
              apiKey: row.original,
              mode: 'delete',
            })
          }>
          <TrashIcon className="size-4 text-red-500" />
          Видалити
        </Button>
      </Popover>
    )),
  },
];
