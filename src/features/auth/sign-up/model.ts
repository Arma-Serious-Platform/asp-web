import { api } from '@/shared/sdk';
import { SignUpDto } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';

class SignUpModel {
  constructor() {
    makeAutoObservable(this);
  }

  successEmail = '';

  signUp = async (dto: SignUpDto) => {
    await api.singUp(dto);
  };

  setSuccessEmail = (email: string) => {
    this.successEmail = email;
  };

  reset = () => {
    this.setSuccessEmail('');
  };
}

const signUpModel = new SignUpModel();

export { signUpModel, SignUpModel };
