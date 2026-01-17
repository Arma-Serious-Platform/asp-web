import { Loader } from '@/shared/model/loader';
import { api } from '@/shared/sdk';
import { makeAutoObservable } from 'mobx';

export class ConfirmSignUpModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  isSuccess: undefined | boolean = undefined;

  setSuccess = (success: boolean) => {
    this.isSuccess = success;
  };

  confirmSignUp = async (token: string) => {
    try {
      this.loader.start();

      await api.confirmSignUp(token);

      this.setSuccess(true);
    } catch {
      this.setSuccess(false);
    } finally {
      this.loader.stop();
    }
  };
}

const confirmSignUpModel = new ConfirmSignUpModel();

export { confirmSignUpModel };
