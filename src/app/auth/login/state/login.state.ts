import { session } from '@/entities/session/session.state';
import { authApi } from '@/shared/sdk';
import { LoginDto, User } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';

export type LoginStep = 'credentials' | 'twoFactor';

export type PendingTwoFactorLogin = {
  twoFactorToken: string;
};

export class LoginState {
  step: LoginStep = 'credentials';

  pendingTwoFactor: PendingTwoFactorLogin | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  reset = () => {
    this.step = 'credentials';
    this.pendingTwoFactor = null;
  };

  login = async (dto: LoginDto) => {
    const result = await authApi.login(dto);

    if ('requiresTwoFactor' in result.data && result.data.requiresTwoFactor) {
      this.pendingTwoFactor = {
        twoFactorToken: String(result.data.twoFactorToken),
      };
      this.step = 'twoFactor';
      return null;
    }

    const user = result.data as User;
    session.authorize(user);
    this.reset();

    return user;
  };

  verifyTwoFactor = async (code?: string, recoveryCode?: string) => {
    if (!this.pendingTwoFactor) {
      throw new Error('Two-factor login has not been started');
    }

    const { data: user } = await authApi.verifyTwoFactorLogin({
      twoFactorToken: this.pendingTwoFactor.twoFactorToken,
      code,
      recoveryCode,
    });

    session.authorize(user);
    this.reset();

    return user;
  };
}

const loginState = new LoginState();

export { loginState };
