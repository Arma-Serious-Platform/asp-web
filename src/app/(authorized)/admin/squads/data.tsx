import { session } from '@/entities/session/model';
import { Side, Squad } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Popover } from '@/shared/ui/moleculas/popover';
import { ColumnDef } from '@tanstack/react-table';
import { EditIcon, MoreHorizontalIcon, TrashIcon } from 'lucide-react';

import { observer } from 'mobx-react-lite';

import Image from 'next/image';
import { squadsPageModel } from './model';
import { UserNicknameText } from '@/entities/user/ui/user-text';

export const columns: ColumnDef<Squad>[] = [
  {
    accessorKey: 'logo',
    header: () => <div>Назва</div>,
    cell: ({ row }) => {
      return (
        <Image
          src={row.original.logoUrl || '/images/avatar.jpg'}
          alt={row.original.name}
          width={40}
          height={40}
        />
      );
    },
  },

  {
    accessorKey: 'tag',
    header: () => <div>Тег</div>,
    cell: ({ row }) => {
      return <div>{row.original.tag}</div>;
    },
  },

  {
    accessorKey: 'name',
    header: () => <div>Назва</div>,
    cell: ({ row }) => {
      return <div>{row.original.name}</div>;
    },
  },

  {
    accessorKey: 'leader',
    header: () => <div>Лідер</div>,
    cell: ({ row }) => {
      return (
        <div>
          <UserNicknameText
            user={row.original.leader || null}
            tag={row.original.tag}
            sideType={row.original.side?.type}
          />
        </div>
      );
    },
  },

  {
    accessorKey: 'members',
    header: () => <div>Учасників</div>,
    cell: ({ row }) => {
      return <div>{row.original.activeCount || 0}</div>;
    },
  },

  {
    accessorKey: 'type',
    header: () => <div>Сторона</div>,
    cell: observer(({ row }) => {
      return <div>{row.original.side?.name}</div>;
    }),
  },

  {
    accessorKey: 'server',
    header: () => <div>Сервер</div>,
    cell: observer(({ row }) => {
      return <div>{row.original.side?.server?.name}</div>;
    }),
  },

  {
    accessorKey: 'actions',
    header: () => <div>Дії</div>,
    cell: observer(() => {
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
              squadsPageModel.manageSquad.modal.open({
                mode: 'manage',
              });
            }}>
            <EditIcon className='w-4 h-4 text-yellow-500' />
            Редагувати
          </Button>

          <Button
            size='sm'
            variant='secondary'
            align='left'
            onClick={() => {
              squadsPageModel.manageSquad.modal.open({
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
