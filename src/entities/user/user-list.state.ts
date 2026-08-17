import { Pagination } from '@/shared/state/pagination';
import { usersApi } from '@/shared/sdk';
import { FindUsersDto, User } from '@/shared/sdk/types';
import { UserModel } from './user.model';
import { makeAutoObservable } from 'mobx';

/**
 * @deprecated Prefer page state + `new Pagination({ api, Model: UserModel })`.
 * Kept for gradual migration of manage features.
 */
class UsersState {
  constructor() {
    makeAutoObservable(this);
  }

  pagination = new Pagination<User, FindUsersDto, UserModel>({
    api: usersApi.findUsers,
    Model: UserModel,
  });

  reset = () => {
    this.pagination.reset();
  };
}

export { UsersState };
