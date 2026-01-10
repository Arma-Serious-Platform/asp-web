import {
  UserNicknameText,
  UserRoleText,
  UserStatusText,
} from '@/entities/user/ui/user-text';

import { ROUTES } from '@/shared/config/routes';
import { User, UserStatus } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { ColumnDef } from '@tanstack/react-table';
import {
  BanIcon,
  MoreHorizontalIcon,
  HandHeartIcon,
  SearchCodeIcon,
} from 'lucide-react';
import Link from 'next/link';
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
          <UserNicknameText
            link
            user={row.original}
            sideType={row.original.squad?.side?.type}
          />
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: () => <div>Роль</div>,
    cell: ({ row }) => {
      return (
        <div>
          <UserRoleText
            role={row.original.role}
            isMissionReviewer={row.original.isMissionReviewer}
          />
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
          <UserStatusText status={row.original.status} />
        </div>
      );
    }),
  },
  {
    accessorKey: 'steamUUID',
    header: () => <div>STEAM UUID</div>,
    cell: ({ row }) => {
      return <div>{row.original.steamId || ''}</div>;
    },
  },
  {
    accessorKey: 'actions',
    header: () => <div className='text-center'>Дії</div>,
    cell: observer(({ row }) => {
      if (session.user?.user?.id === row.original.id) {
        return null;
      }

      return (
        <div className='w-full flex gap-2 justify-center'>
          <Popover
            className='w-fit'
            trigger={
              <Button size='icon' variant='secondary'>
                <MoreHorizontalIcon className='w-4 h-4' />
              </Button>
            }>
            <div className='flex flex-col w-fit gap-2'>
              <View.Condition if={row.original.isMissionReviewer}>
                <Button
                  size='sm'
                  className='w-fit'
                  align='left'
                  variant='secondary'
                  onClick={() => {
                    usersModel.changeIsReviewerModel.visibility.open({
                      user: row.original,
                      isMissionReviewer: false,
                    });
                  }}>
                  <SearchCodeIcon className='w-4 h-4 text-amber-200' />
                  Зняти з перевірки місій
                </Button>
              </View.Condition>

              <View.Condition if={!row.original.isMissionReviewer}>
                <Button
                  size='sm'
                  className='w-fit'
                  align='left'
                  variant='secondary'
                  onClick={() => {
                    usersModel.changeIsReviewerModel.visibility.open({
                      user: row.original,
                      isMissionReviewer: true,
                    });
                  }}>
                  <SearchCodeIcon className='w-4 h-4 text-amber-200' />
                  Зробити перевіряючим місій
                </Button>
              </View.Condition>

              <View.Condition if={row.original.status !== UserStatus.BANNED}>
                <Button
                  size='sm'
                  className='w-fi'
                  align='left'
                  variant='secondary'
                  onClick={() => {
                    usersModel.banUnbanUserModel.visibility.open({
                      user: row.original,
                    });
                  }}>
                  <BanIcon className='w-4 h-4 text-red-500' />
                  Заблокувати
                </Button>
              </View.Condition>

              <View.Condition if={row.original.status === UserStatus.BANNED}>
                <Button
                  size='sm'
                  variant='secondary'
                  className='w-full'
                  align='left'
                  onClick={() => {
                    usersModel.banUnbanUserModel.visibility.open({
                      user: row.original,
                    });
                  }}>
                  <HandHeartIcon className='w-4 h-4 text-green-500' />
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
