import Image from 'next/image';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { EditIcon, MoreHorizontalIcon, TrashIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { Achievement } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Popover } from '@/shared/ui/moleculas/popover';
import { achievementsPageState } from './state/achievements-page.state';

export const columns: ColumnDef<Achievement>[] = [
  {
    accessorKey: 'icon',
    header: () => <div>Іконка</div>,
    cell: ({ row }) => {
      const iconUrl = row.original.icon?.url;

      return (
        <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/60">
          {iconUrl ? (
            <Image
              src={iconUrl}
              alt={row.original.title}
              width={40}
              height={40}
              className="size-10 object-cover"
              unoptimized={!iconUrl.startsWith('https')}
            />
          ) : (
            <span className="text-[10px] text-zinc-500">—</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'title',
    header: () => <div>Назва</div>,
    cell: ({ row }) => <div className="font-medium text-zinc-100">{row.original.title}</div>,
  },
  {
    accessorKey: 'description',
    header: () => <div>Опис</div>,
    cell: ({ row }) => (
      <div className="max-w-md truncate text-sm text-zinc-400">{row.original.description}</div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: () => <div>Створено</div>,
    cell: ({ row }) => (
      <div className="text-sm text-zinc-400">
        {row.original.createdAt ? dayjs(row.original.createdAt).format('DD.MM.YYYY HH:mm') : '—'}
      </div>
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
            achievementsPageState.manageAchievement.modal.open({
              achievement: row.original,
              mode: 'manage',
            })
          }>
          <EditIcon className="size-4 text-yellow-500" />
          Редагувати
        </Button>
        <Button
          size="sm"
          variant="secondary"
          align="left"
          onClick={() =>
            achievementsPageState.manageAchievement.modal.open({
              achievement: row.original,
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
