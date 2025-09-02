import { Server, Side } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { ColumnDef } from '@tanstack/react-table';
import { EditIcon, MoreHorizontalIcon, TrashIcon } from 'lucide-react';

import { observer } from 'mobx-react-lite';
import { session } from '@/entities/session/model';

import { ServerStatusText } from '@/entities/server/ui/server-text';
import { Popover } from '@/shared/ui/moleculas/popover';
import { sidesModel } from './model';
import { SideTypeText } from '@/entities/side/ui/side-text';

export const columns: ColumnDef<Side>[] = [
  {
    accessorKey: 'name',
    header: () => <div>Назва</div>,
    cell: ({ row }) => {
      return <div>{row.original.name}</div>;
    },
  },

  {
    accessorKey: 'type',
    header: () => <div>Тип</div>,
    cell: observer(({ row }) => {
      return (
        <div>
          <SideTypeText type={row.original.type} />
        </div>
      );
    }),
  },

  // {
  //   accessorKey: 'actions',
  //   header: () => <div>Дії</div>,
  //   cell: observer(({ row }) => {
  //     if (session.user?.user?.id === row.original.id) {
  //       return null;
  //     }

  //     return (
  //       <Popover
  //         className='w-fit flex flex-col gap-2'
  //         trigger={
  //           <Button size='icon' variant='secondary'>
  //             <MoreHorizontalIcon className='w-4 h-4' />
  //           </Button>
  //         }>
  //         <Button
  //           size='sm'
  //           variant='secondary'
  //           align='left'
  //           onClick={() => {
  //             sidesModel.manageServer.modal.open({
  //               mode: 'manage',
  //             });
  //           }}>
  //           <EditIcon className='w-4 h-4 text-yellow-500' />
  //           Редагувати
  //         </Button>

  //         <Button
  //           variant='secondary'
  //           align='left'
  //           onClick={() => {
  //             sidesModel.manageServer.modal.open({
  //               mode: 'delete',
  //             });
  //           }}>
  //           <TrashIcon className='w-4 h-4 text-red-500' />
  //           Видалити
  //         </Button>
  //       </Popover>
  //     );
  //   }),
  // },
];
