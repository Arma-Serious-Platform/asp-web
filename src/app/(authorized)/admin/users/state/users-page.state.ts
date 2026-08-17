import { UserModel } from '@/entities/user/user.model';
import { UserAdminActionsState } from '@/app/(authorized)/admin/users/state/admin-actions.state';
import { usersApi } from '@/shared/sdk';
import { FindUsersDto, User, UserRole, UserStatus, UserWarning } from '@/shared/sdk/types';
import { Pagination } from '@/shared/state/pagination';
import { makeAutoObservable } from 'mobx';

class UsersPageState {
  constructor() {
    makeAutoObservable(this);
  }

  pagination = new Pagination<User, FindUsersDto, UserModel>({
    api: usersApi.findUsers,
    Model: UserModel,
  });

  adminActions = new UserAdminActionsState();

  afterBanUser = (user: User) => {
    const next = this.pagination.data.map(u => {
      if (u.id === user.id) {
        u.update({ ...u.data, status: user.status, bannedUntil: user.bannedUntil });
      }
      return u;
    });
    this.pagination.setData(next);
  };

  afterChangeNickname = (user: User) => {
    const next = this.pagination.data.map(u => {
      if (u.id === user.id) {
        u.update({ ...u.data, nickname: user.nickname });
      }
      return u;
    });
    this.pagination.setData(next);
  };

  afterIssueWarning = (warning: UserWarning) => {
    const next = this.pagination.data.map(u => {
      if (u.id === warning.userId) {
        u.update({
          ...u.data,
          _count: {
            ...u.data._count,
            warnings: ((u.data._count as { warnings?: number } | undefined)?.warnings ?? 0) + 1,
          },
        });
      }
      return u;
    });
    this.pagination.setData(next);
  };

  afterWarningRemoved = (warning: UserWarning) => {
    const next = this.pagination.data.map(u => {
      if (u.id === warning.userId) {
        u.update({
          ...u.data,
          _count: {
            ...u.data._count,
            warnings: Math.max(((u.data._count as { warnings?: number } | undefined)?.warnings ?? 1) - 1, 0),
          },
        });
      }
      return u;
    });
    this.pagination.setData(next);
  };

  afterUnbanUser = (user: User) => {
    const next = this.pagination.data.map(u => {
      if (u.id === user.id) {
        u.update({ ...u.data, status: UserStatus.ACTIVE, bannedUntil: null });
      }
      return u;
    });
    this.pagination.setData(next);
  };

  afterChangeRole = (userId: string, roles: UserRole[]) => {
    const next = this.pagination.data.map(u => {
      if (u.id === userId) {
        u.update({ ...u.data, roles });
      }
      return u;
    });
    this.pagination.setData(next);
  };
}

export const usersPageState = new UsersPageState();
