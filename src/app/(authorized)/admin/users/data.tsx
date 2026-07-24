import { UserNicknameText, UserRoleText, UserStatusText } from '@/entities/user/ui/user-text';

import { ROUTES } from '@/shared/config/routes';
import { User, UserRole, UserStatus } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { ColumnDef } from '@tanstack/react-table';
import {
  BanIcon,
  HandHeartIcon,
  MoreHorizontalIcon,
  PencilIcon,
  ScrollTextIcon,
  ShieldIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { usersModel } from './model';
import { observer } from 'mobx-react-lite';
import { session } from '@/entities/session/model';
import { View } from '@/features/view';
import { Popover } from '@/shared/ui/moleculas/popover';

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

      return (
        <div className="w-full flex gap-2 justify-center">
          <Popover
            className="w-fit"
            trigger={
              <Button size="icon" variant="secondary">
                <MoreHorizontalIcon className="w-4 h-4" />
              </Button>
            }>
            <div className="flex flex-col w-fit gap-2">
              <View.Condition
                if={
                  session.canManageRoles &&
                  !(
                    session.user?.user?.roles?.includes(UserRole.OWNER) &&
                    row.original.roles?.includes(UserRole.OWNER)
                  )
                }>
                <Button
                  size="sm"
                  className="w-full"
                  align="left"
                  variant="secondary"
                  onClick={() => {
                    usersModel.changeUserRoleModel.visibility.open({ user: row.original });
                  }}>
                  <ShieldIcon className="w-4 h-4" />
                  Змінити ролі
                </Button>
              </View.Condition>

              <View.Condition if={session.canModerateUsers}>
                <Button
                  size="sm"
                  className="w-full"
                  align="left"
                  variant="secondary"
                  onClick={() => {
                    usersModel.adminChangeNicknameModel.visibility.open({
                      user: row.original,
                    });
                  }}>
                  <PencilIcon className="w-4 h-4" />
                  Змінити позивний
                </Button>
              </View.Condition>

              <View.Condition if={session.canModerateUsers}>
                <Button
                  size="sm"
                  className="w-full"
                  align="left"
                  variant="secondary"
                  onClick={() => {
                    usersModel.issueUserWarningModel.visibility.open({
                      user: row.original,
                    });
                  }}>
                  <TriangleAlertIcon className="w-4 h-4 text-amber-300" />
                  Видати попередження
                </Button>
              </View.Condition>

              <View.Condition if={session.canModerateUsers}>
                <Button
                  size="sm"
                  className="w-full"
                  align="left"
                  variant="secondary"
                  onClick={() => {
                    usersModel.punishmentHistoryModel.visibility.open({
                      user: row.original,
                    });
                  }}>
                  <ScrollTextIcon className="w-4 h-4 text-sky-300" />
                  Історія покарань
                </Button>
              </View.Condition>

              <View.Condition if={session.canModerateUsers && row.original.status !== UserStatus.BANNED}>
                <Button
                  size="sm"
                  className="w-full"
                  align="left"
                  variant="secondary"
                  onClick={() => {
                    usersModel.banUnbanUserModel.visibility.open({
                      user: row.original,
                    });
                  }}>
                  <BanIcon className="w-4 h-4 text-red-500" />
                  Заблокувати
                </Button>
              </View.Condition>

              <View.Condition if={session.canModerateUsers && row.original.status === UserStatus.BANNED}>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  align="left"
                  onClick={() => {
                    usersModel.banUnbanUserModel.visibility.open({
                      user: row.original,
                    });
                  }}>
                  <HandHeartIcon className="w-4 h-4 text-green-500" />
                  Розблокувати
                </Button>
              </View.Condition>
            </div>
          </Popover>
        </div>
      );
    }),
  },
];
