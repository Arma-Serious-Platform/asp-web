
import { BanUnbanUserModel } from '@/features/user/ban-unban-user/model';
import { Pagination } from '@/shared/model/pagination';
import { api } from '@/shared/sdk';
import { User, UserStatus } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class UsersModel {
  constructor() {
    makeAutoObservable(this);
  }

  pagination = new Pagination({ api: api.findUsers });

  banUnbanUserModel = new BanUnbanUserModel();

  afterBanUser = (user: User) => {
    const foundUser = this.pagination.data.map((u) => {
      if (u.id === user.id) {
        u.status = UserStatus.BANNED;
      }

      return u;
    });

    this.pagination.setData(foundUser);
  };

  afterUnbanUser = (user: User) => {
    const foundUser = this.pagination.data.map((u) => {
      if (u.id === user.id) {
        u.status = UserStatus.ACTIVE;
        u.bannedUntil = null;
      }

      return u;
    });

    this.pagination.setData(foundUser);
  };
}

export const usersModel = new UsersModel();
