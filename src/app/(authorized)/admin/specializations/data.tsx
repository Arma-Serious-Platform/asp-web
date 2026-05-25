import Image from 'next/image';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { EditIcon, MoreHorizontalIcon, TrashIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { Specialization } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Popover } from '@/shared/ui/moleculas/popover';
import { adminSpecializationsModel } from './model';

export const columns: ColumnDef<Specialization>[] = [
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
              alt={row.original.name}
              width={40}
              height={40}
              className="size-10 object-cover"
              unoptimized={!iconUrl.startsWith('https')}
            />
          ) : (
            <span className="size-2 rounded-full" style={{ backgroundColor: row.original.color || '#84cc16' }} />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'name',
    header: () => <div>Назва</div>,
    cell: ({ row }) => <div className="font-medium text-zinc-100">{row.original.name}</div>,
  },
  {
    accessorKey: 'color',
    header: () => <div>Колір</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm">
        <span className="size-3 rounded-full" style={{ backgroundColor: row.original.color || '#84cc16' }} />
        <span className="font-mono text-zinc-400">{row.original.color || '#84cc16'}</span>
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
            adminSpecializationsModel.manageSpecialization.modal.open({
              specialization: row.original,
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
            adminSpecializationsModel.manageSpecialization.modal.open({
              specialization: row.original,
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
