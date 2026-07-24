import { UserAdminActionsModel } from '@/features/user/admin-actions';
import { Pagination } from '@/shared/model/pagination';
import { api } from '@/shared/sdk';
import { User, UserRole, UserStatus, UserWarning } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';

export class UsersModel {
  constructor() {
    makeAutoObservable(this);
  }

  pagination = new Pagination({ api: api.findUsers });

  adminActions = new UserAdminActionsModel();

  afterBanUser = (user: User) => {
    const foundUser = this.pagination.data.map(u => {
      if (u.id === user.id) {
        u.status = user.status;
        u.bannedUntil = user.bannedUntil;
      }

      return u;
    });

    this.pagination.setData(foundUser);
  };

  afterChangeNickname = (user: User) => {
    const foundUser = this.pagination.data.map(u => {
      if (u.id === user.id) {
        u.nickname = user.nickname;
      }

      return u;
    });

    this.pagination.setData(foundUser);
  };

  afterIssueWarning = (warning: UserWarning) => {
    const foundUser = this.pagination.data.map(u => {
      if (u.id === warning.userId) {
        u._count = {
          ...u._count,
          warnings: (u._count?.warnings ?? 0) + 1,
        };
      }

      return u;
    });

    this.pagination.setData(foundUser);
  };

  afterWarningRemoved = (warning: UserWarning) => {
    const foundUser = this.pagination.data.map(u => {
      if (u.id === warning.userId) {
        u._count = {
          ...u._count,
          warnings: Math.max((u._count?.warnings ?? 1) - 1, 0),
        };
      }

      return u;
    });

    this.pagination.setData(foundUser);
  };

  afterUnbanUser = (user: User) => {
    const foundUser = this.pagination.data.map(u => {
      if (u.id === user.id) {
        u.status = UserStatus.ACTIVE;
        u.bannedUntil = null;
      }

      return u;
    });

    this.pagination.setData(foundUser);
  };

  afterChangeRole = (userId: string, roles: UserRole[]) => {
    const foundUser = this.pagination.data.map(u => {
      if (u.id === userId) {
        u.roles = roles;
      }

      return u;
    });

    this.pagination.setData(foundUser);
  };
}

export const usersModel = new UsersModel();
