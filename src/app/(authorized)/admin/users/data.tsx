import { UserNicknameText, UserRoleText, UserStatusText } from '@/entities/user/ui/user-text';

import { User } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontalIcon } from 'lucide-react';
import { usersModel } from './model';
import { observer } from 'mobx-react-lite';
import { session } from '@/entities/session/model';
import { Popover } from '@/shared/ui/moleculas/popover';
import {
  UserAdminActionsButtons,
  getUserAdminActionsAvailability,
  hasAnyUserAdminAction,
} from '@/features/user/admin-actions';

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'nickname',
    header: () => <div>Позивний</div>,
    cell: ({ row }) => {
      return (
        <div>
          <UserNicknameText link user={row.original} sideType={row.original.squad?.side?.type} />
        </div>
      );
    },
  },
  {
    accessorKey: 'roles',
    header: () => <div>Роль</div>,
    cell: ({ row }) => {
      return (
        <div>
          <UserRoleText roles={row.original.roles} />
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: () => <div>Статус</div>,
    cell: observer(({ row }) => {
      return (
        <div>
          <UserStatusText status={row.original.status} bannedUntil={row.original.bannedUntil} />
        </div>
      );
    }),
  },
  {
    accessorKey: 'warnings',
    header: () => <div>Попередження</div>,
    cell: ({ row }) => {
      return <div>{row.original._count?.warnings ?? 0}</div>;
    },
  },
  {
    accessorKey: 'steamUUID',
    header: observer(() => {
      if (!session.canSeeSensitiveUsersData) return null;

      return <div>STEAM ID</div>;
    }),
    cell: observer(({ row }) => {
      if (!session.canSeeSensitiveUsersData) return null;

      return <div>{row.original.steamId || ''}</div>;
    }),
  },
  {
    accessorKey: 'actions',
    header: () => <div className="text-center">Дії</div>,
    cell: observer(({ row }) => {
      if (session.user?.user?.id === row.original.id) {
        return null;
      }

      if (!hasAnyUserAdminAction(getUserAdminActionsAvailability(row.original))) {
        return null;
      }

      return (
        <div className="w-full flex gap-2 justify-center">
          <Popover
            className="w-fit"
            trigger={
              <Button size="icon" variant="secondary">
                <MoreHorizontalIcon className="w-4 h-4" />
              </Button>
            }>
            <UserAdminActionsButtons user={row.original} model={usersModel.adminActions} className="w-fit" />
          </Popover>
        </div>
      );
    }),
  },
];
