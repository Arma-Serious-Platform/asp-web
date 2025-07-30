import { api } from '@/shared/sdk';
import { ChangePasswordDto } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';

class ChangePasswordModel {
  constructor() {
    makeAutoObservable(this);
  }

  changePassword = async (dto: ChangePasswordDto) => {
    await api.changePassword(dto);
  };
}

const changePassword = new ChangePasswordModel();

export { changePassword, ChangePasswordModel };
