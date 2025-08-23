import { api } from '@/shared/sdk';
import { ConfirmForgotPasswordDto } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';

class ForgotPasswordConfirmModel {
  constructor() {
    makeAutoObservable(this);
  }

  isExpired = false;

  setExpired = (expired: boolean) => {
    this.isExpired = expired;
  };

  forgotPassword = async (dto: ConfirmForgotPasswordDto) => {
    await api.confirmForgotPassword(dto);
  };

  reset = () => {
    this.isExpired = false;
  };
}

const forgotPasswordConfirmModel = new ForgotPasswordConfirmModel();

export { forgotPasswordConfirmModel, ForgotPasswordConfirmModel };
