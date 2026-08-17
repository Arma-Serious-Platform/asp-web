import { authApi } from '@/shared/sdk';
import { ConfirmForgotPasswordDto } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';

export class ForgotPasswordConfirmState {
  constructor() {
    makeAutoObservable(this);
  }

  isExpired = false;

  setExpired = (expired: boolean) => {
    this.isExpired = expired;
  };

  forgotPassword = async (dto: ConfirmForgotPasswordDto) => {
    await authApi.confirmForgotPassword(dto);
  };

  reset = () => {
    this.isExpired = false;
  };
}

const forgotPasswordConfirmState = new ForgotPasswordConfirmState();

export { forgotPasswordConfirmState };
