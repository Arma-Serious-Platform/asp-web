import { authApi } from '@/shared/sdk';
import { SignUpDto } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';

export class SignUpState {
  constructor() {
    makeAutoObservable(this);
  }

  successEmail = '';

  signUp = async (dto: SignUpDto) => {
    await authApi.singUp(dto);
  };

  setSuccessEmail = (email: string) => {
    this.successEmail = email;
  };

  reset = () => {
    this.setSuccessEmail('');
  };
}

const signUpState = new SignUpState();

export { signUpState };
