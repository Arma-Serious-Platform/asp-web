import { IslandModel } from '@/entities/island/island.model';
import { Button } from '@/shared/ui/atoms/button';
import { Popover } from '@/shared/ui/moleculas/popover';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { EditIcon, MoreHorizontalIcon, TrashIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { islandsPageState } from './state/islands-page.state';

export const columns: ColumnDef<IslandModel>[] = [
  {
    accessorKey: 'name',
    header: () => <div>Назва</div>,
    cell: ({ row }) => <div>{row.original.name}</div>,
  },
  {
    accessorKey: 'code',
    header: () => <div>Код</div>,
    cell: ({ row }) => <div className="font-mono text-sm">{row.original.data.code}</div>,
  },
  {
    accessorKey: 'createdAt',
    header: () => <div>Створено</div>,
    cell: ({ row }) => (
      <div className="text-sm text-zinc-400">{dayjs(row.original.data.createdAt).format('DD.MM.YYYY HH:mm')}</div>
    ),
  },
  {
    id: 'actions',
    header: () => <div>Дії</div>,
    cell: observer(({ row }) => {
      return (
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
            onClick={() => islandsPageState.manageIsland.modal.open({ island: row.original.data, mode: 'manage' })}>
            <EditIcon className="size-4 text-yellow-500" />
            Редагувати
          </Button>
          <Button
            size="sm"
            variant="secondary"
            align="left"
            onClick={() => islandsPageState.manageIsland.modal.open({ island: row.original.data, mode: 'delete' })}>
            <TrashIcon className="size-4 text-red-500" />
            Видалити
          </Button>
        </Popover>
      );
    }),
  },
];
