import { UserModel } from '@/entities/user/model';
import { makeAutoObservable } from 'mobx';

export class UsersModel {
  constructor() {
    makeAutoObservable(this);
  }

  users = new UserModel();
}

export const usersModel = new UsersModel();
