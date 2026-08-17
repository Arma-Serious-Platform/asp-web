import { UserModel } from '@/entities/user/user.model';
import { UserNicknameText, UserRoleText, UserStatusText } from '@/entities/user/ui/user-text';

import { UserRole, UserStatus, SideType } from '@/shared/sdk/types';

import { Button } from '@/shared/ui/atoms/button';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontalIcon } from 'lucide-react';
import { usersPageState } from './state/users-page.state';
import { observer } from 'mobx-react-lite';
import { session } from '@/entities/session/session.state';
import { Popover } from '@/shared/ui/moleculas/popover';
import {
  UserAdminActionsButtons,
  getUserAdminActionsAvailability,
  hasAnyUserAdminAction,
} from '@/app/(authorized)/admin/users';

export const columns: ColumnDef<UserModel>[] = [
  {
    accessorKey: 'nickname',
    header: () => <div>Позивний</div>,
    cell: ({ row }) => {
      return (
        <div>
          <UserNicknameText
            link
            user={row.original.data}
            sideType={(row.original.data.squad?.side as { type?: SideType } | undefined)?.type}
          />
        </div>
      );
    },
  },
  {
    accessorKey: 'roles',
    header: () => <div>Ролі</div>,
    cell: ({ row }) => {
      return (
        <div>
          <UserRoleText roles={row.original.data.roles as UserRole[]} />
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
          <UserStatusText
            status={row.original.data.status as UserStatus}
            bannedUntil={row.original.data.bannedUntil as Date | null}
          />
        </div>
      );
    }),
  },
  {
    accessorKey: 'warnings',
    header: () => <div>Попередження</div>,
    cell: ({ row }) => {
      return <div>{row.original.data._count?.warnings ?? 0}</div>;
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

      return <div>{row.original.data.steamId || ''}</div>;
    }),
  },
  {
    accessorKey: 'actions',
    header: () => <div className="text-center">Дії</div>,
    cell: observer(({ row }) => {
      if (session.user?.data?.id === row.original.id) {
        return null;
      }

      if (!hasAnyUserAdminAction(getUserAdminActionsAvailability(row.original.data))) {
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
            <UserAdminActionsButtons user={row.original.data} model={usersPageState.adminActions} className="w-fit" />
          </Popover>
        </div>
      );
    }),
  },
];
