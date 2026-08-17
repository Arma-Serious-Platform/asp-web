import { session } from '@/entities/session/session.state';
import { SquadModel } from '@/entities/squad/squad.model';
import { Button } from '@/shared/ui/atoms/button';
import { Popover } from '@/shared/ui/moleculas/popover';
import { ColumnDef } from '@tanstack/react-table';
import { EditIcon, MoreHorizontalIcon, TrashIcon } from 'lucide-react';

import { observer } from 'mobx-react-lite';

import Image from 'next/image';
import { squadsPageState } from './state/squads-page.state';
import { UserNicknameText } from '@/entities/user/ui/user-text';

export const columns: ColumnDef<SquadModel>[] = [
  {
    accessorKey: 'logo',
    header: () => <div>Назва</div>,
    cell: ({ row }) => {
      return (
        <Image
          src={row.original.data.logo?.url || '/images/avatar.jpg'}
          alt={row.original.data.name}
          width={40}
          height={40}
          unoptimized={!row.original.data.logo?.url?.startsWith('https')}
        />
      );
    },
  },

  {
    accessorKey: 'tag',
    header: () => <div>Тег</div>,
    cell: ({ row }) => {
      return <div>{row.original.data.tag}</div>;
    },
  },

  {
    accessorKey: 'name',
    header: () => <div>Назва</div>,
    cell: ({ row }) => {
      return <div>{row.original.data.name}</div>;
    },
  },

  {
    accessorKey: 'leader',
    header: () => <div>Лідер</div>,
    cell: ({ row }) => {
      return (
        <div>
          <UserNicknameText
            user={row.original.data.leader || null}
            tag={row.original.data.tag}
            sideType={row.original.data.side?.type}
          />
        </div>
      );
    },
  },

  {
    accessorKey: 'members',
    header: () => <div>Учасників</div>,
    cell: ({ row }) => {
      return <div>{row.original.data?._count?.members ?? 0}</div>;
    },
  },

  {
    accessorKey: 'type',
    header: () => <div>Сторона</div>,
    cell: observer(({ row }) => {
      return <div>{row.original.data.side?.name}</div>;
    }),
  },

  {
    accessorKey: 'server',
    header: () => <div>Сервер</div>,
    cell: observer(({ row }) => {
      return <div>{row.original.data.side?.server?.name}</div>;
    }),
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
              squadsPageState.manageSquad.modal.open({
                mode: 'manage',
                squad: row.original.data,
              });
            }}>
            <EditIcon className="w-4 h-4 text-yellow-500" />
            Редагувати
          </Button>

          <Button
            size="sm"
            variant="secondary"
            align="left"
            onClick={() => {
              squadsPageState.manageSquad.modal.open({
                mode: 'delete',
                squad: row.original.data,
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
