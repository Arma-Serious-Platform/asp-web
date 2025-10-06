import { Server, ServerStatus } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { ColumnDef } from '@tanstack/react-table';
import {
  BanIcon,
  EditIcon,
  HandHeartIcon,
  MoreHorizontalIcon,
  TrashIcon,
} from 'lucide-react';

import { observer } from 'mobx-react-lite';
import { session } from '@/entities/session/model';
import { View } from '@/features/view';
import { ServerStatusText } from '@/entities/server/ui/server-text';
import { Popover } from '@/shared/ui/moleculas/popover';
import { serversModel } from './model';

export const columns: ColumnDef<Server>[] = [
  {
    accessorKey: 'name',
    header: () => <div>Назва</div>,
    cell: ({ row }) => {
      return <div>{row.original.name}</div>;
    },
  },

  {
    accessorKey: 'status',
    header: () => <div>Статус</div>,
    cell: observer(({ row }) => {
      return (
        <div>
          <ServerStatusText status={row.original.status} />
        </div>
      );
    }),
  },

  {
    accessorKey: 'ip',
    header: () => <div>IP</div>,
    cell: observer(({ row }) => {
      return <div>{row.original.ip}</div>;
    }),
  },

  {
    accessorKey: 'port',
    header: () => <div>Порт</div>,
    cell: observer(({ row }) => {
      return <div>{row.original.port}</div>;
    }),
  },

  {
    accessorKey: 'actions',
    header: () => <div>Дії</div>,
    cell: observer(({ row }) => {
      if (session.user?.user?.id === row.original.id) {
        return null;
      }

      return (
        <Popover
          className='w-fit flex flex-col gap-2'
          trigger={
            <Button size='icon' variant='secondary'>
              <MoreHorizontalIcon className='w-4 h-4' />
            </Button>
          }>
          <Button
            size='sm'
            variant='secondary'
            align='left'
            onClick={() => {
              serversModel.manageServer.modal.open({
                server: row.original,
                mode: 'manage',
              });
            }}>
            <EditIcon className='w-4 h-4 text-yellow-500' />
            Редагувати
          </Button>

          <Button
            variant='secondary'
            align='left'
            size='sm'
            onClick={() => {
              serversModel.manageServer.modal.open({
                server: row.original,
                mode: 'delete',
              });
            }}>
            <TrashIcon className='w-4 h-4 text-red-500' />
            Видалити
          </Button>
        </Popover>
      );
    }),
  },
];
