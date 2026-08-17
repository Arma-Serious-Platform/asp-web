import { authApi } from '@/shared/sdk';
import { ChangePasswordDto } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';

class ChangePasswordState {
  constructor() {
    makeAutoObservable(this);
  }

  changePassword = async (dto: ChangePasswordDto) => {
    await authApi.changePassword(dto);
  };
}

const changePasswordState = new ChangePasswordState();

export { changePasswordState, ChangePasswordState };
