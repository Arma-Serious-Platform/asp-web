import { Server, ServerStatus } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { ColumnDef } from '@tanstack/react-table';
import { BanIcon, EditIcon, HandHeartIcon } from 'lucide-react';

import { serversModel } from './model';
import { observer } from 'mobx-react-lite';
import { session } from '@/entities/session/model';
import { View } from '@/features/view';
import { ServerStatusText } from '@/entities/server/ui/server-text';

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
        <div className='w-full flex gap-2'>
          <Button size='sm' variant='secondary'>
            Редагувати
            <EditIcon className='w-4 h-4 text-yellow-500' />
          </Button>

          <View.Condition if={row.original.status !== ServerStatus.INACTIVE}>
            <Button size='sm' variant='secondary'>
              Деактивувати
              <BanIcon className='w-4 h-4 text-red-500' />
            </Button>
          </View.Condition>
          <View.Condition if={row.original.status === ServerStatus.INACTIVE}>
            <Button size='sm' variant='secondary'>
              Активувати
              <HandHeartIcon className='w-4 h-4 text-green-500' />
            </Button>
          </View.Condition>
        </div>
      );
    }),
  },
];
