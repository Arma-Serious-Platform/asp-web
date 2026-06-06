import { Loader } from '@/shared/model/loader';
import { api } from '@/shared/sdk';
import { isAxiosError } from 'axios';
import { makeAutoObservable } from 'mobx';

export const CONFIRM_SIGN_UP_MESSAGES = {
  invalidToken: 'Invalid token',
  expiredTokenNewSent: 'Activation token expired. New token sent to your email',
  alreadyConfirmed: 'User already confirmed',
} as const;

export type ConfirmSignUpErrorMessage =
  (typeof CONFIRM_SIGN_UP_MESSAGES)[keyof typeof CONFIRM_SIGN_UP_MESSAGES] | 'unknown';

export class ConfirmSignUpModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  isSuccess: undefined | boolean = undefined;
  errorMessage: ConfirmSignUpErrorMessage | null = null;

  setSuccess = (success: boolean) => {
    this.isSuccess = success;
    if (success) {
      this.errorMessage = null;
    }
  };

  setFailure = (message: ConfirmSignUpErrorMessage = 'unknown') => {
    this.isSuccess = false;
    this.errorMessage = message;
  };

  confirmSignUp = async (token: string) => {
    try {
      this.loader.start();
      this.errorMessage = null;

      await api.confirmSignUp(token);

      this.setSuccess(true);
    } catch (error) {
      if (isAxiosError(error)) {
        const message = error.response?.data?.message;
        this.setFailure(Object.values(CONFIRM_SIGN_UP_MESSAGES).includes(message) ? message : 'unknown');
      } else {
        this.setFailure('unknown');
      }
    } finally {
      this.loader.stop();
    }
  };
}

const confirmSignUpModel = new ConfirmSignUpModel();

export { confirmSignUpModel };
