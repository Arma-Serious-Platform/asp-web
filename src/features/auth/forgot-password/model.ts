import { api } from '@/shared/sdk';
import { ForgotPasswordDto } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';

class ForgotPasswordModel {
  constructor() {
    makeAutoObservable(this);
  }

  isSended = false;
  isAlreadySended = false;

  setSended = (sended: boolean) => {
    this.isSended = sended;
  };

  setAlreadySended = (alreadySended: boolean) => {
    this.isAlreadySended = alreadySended;
  };

  forgotPassword = async (dto: ForgotPasswordDto) => {
    try {
      await api.forgotPassword(dto);

      this.setSended(true);
    } catch (error) {
      if (error?.response?.data?.message === 'Reset password token is still valid') {
        this.setAlreadySended(true);

        return;
      }

      console.error(error);
    }
  };

  reset = () => {
    this.setSended(false);
    this.setAlreadySended(false);
  };
}

const forgotPasswordModel = new ForgotPasswordModel();

export { forgotPasswordModel, ForgotPasswordModel };
