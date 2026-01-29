import { Weekend } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { ColumnDef } from '@tanstack/react-table';
import { EditIcon, MoreHorizontalIcon, TrashIcon } from 'lucide-react';

import { observer } from 'mobx-react-lite';
import { Popover } from '@/shared/ui/moleculas/popover';
import { weekendsModel } from './model';

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export const columns: ColumnDef<Weekend>[] = [
  {
    accessorKey: 'name',
    header: () => <div>Назва</div>,
    cell: ({ row }) => <div>{row.original.name ?? '—'}</div>,
  },
  {
    accessorKey: 'description',
    header: () => <div>Опис</div>,
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.original.description}>
        {row.original.description ?? '—'}
      </div>
    ),
  },
  {
    accessorKey: 'published',
    header: () => <div>Опубліковано</div>,
    cell: ({ row }) => <div>{row.original.published ? 'Так' : 'Ні'}</div>,
  },
  {
    accessorKey: 'publishedAt',
    header: () => <div>Дата публікації</div>,
    cell: ({ row }) => <div>{formatDate(row.original.publishedAt)}</div>,
  },
  {
    accessorKey: 'actions',
    header: () => <div>Дії</div>,
    cell: observer(({ row }) => {
      return (
        <Popover
          className="w-fit flex flex-col gap-2"
          trigger={
            <Button size="icon" variant="secondary">
              <MoreHorizontalIcon className="w-4 h-4" />
            </Button>
          }>
          <Button
            size="sm"
            variant="secondary"
            align="left"
            onClick={() => {
              weekendsModel.manageWeekend.modal.open({
                weekend: row.original,
                mode: 'manage',
              });
            }}>
            <EditIcon className="w-4 h-4 text-yellow-500" />
            Редагувати
          </Button>

          <Button
            variant="secondary"
            align="left"
            size="sm"
            onClick={() => {
              weekendsModel.manageWeekend.modal.open({
                weekend: row.original,
                mode: 'delete',
              });
            }}>
            <TrashIcon className="w-4 h-4 text-red-500" />
            Видалити
          </Button>
        </Popover>
      );
    }),
  },
];
