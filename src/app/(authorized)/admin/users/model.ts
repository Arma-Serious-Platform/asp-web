import { BanUnbanUserModel } from '@/features/user/ban-unban-user/model';
import { ChangeIsReviewerModel } from '@/features/user/change-is-reviewer/model';
import { ChangeUserRoleModel } from '@/features/user/change-user-role/model';
import { Pagination } from '@/shared/model/pagination';
import { api } from '@/shared/sdk';
import { User, UserRole, UserStatus } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class UsersModel {
  constructor() {
    makeAutoObservable(this);
  }

  pagination = new Pagination({ api: api.findUsers });

  banUnbanUserModel = new BanUnbanUserModel();

  changeIsReviewerModel = new ChangeIsReviewerModel();

  changeUserRoleModel = new ChangeUserRoleModel();

  afterBanUser = (user: User) => {
    const foundUser = this.pagination.data.map(u => {
      if (u.id === user.id) {
        u.status = UserStatus.BANNED;
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

  afterChangeIsReviewer = (userId: string, isMissionReviewer: boolean) => {
    const foundUser = this.pagination.data.map(u => {
      if (u.id === userId) {
        u.isMissionReviewer = isMissionReviewer;
      }

      return u;
    });

    this.pagination.setData(foundUser);
  };

  afterChangeRole = (userId: string, role: UserRole) => {
    const foundUser = this.pagination.data.map(u => {
      if (u.id === userId) {
        u.role = role;
      }

      return u;
    });

    this.pagination.setData(foundUser);
  };
}

export const usersModel = new UsersModel();
