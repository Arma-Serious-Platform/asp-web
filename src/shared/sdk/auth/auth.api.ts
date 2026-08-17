'use client';

import { buildTwoFactorCodePayload } from '@/shared/lib/two-factor-payload';
import { ApiModel } from '../api-model';
import { usersApi } from '../users/users.api';
import type { User } from '../users/users.schemas';
import type {
  ChangePasswordDto,
  ConfirmForgotPasswordDto,
  DisableTwoFactorDto,
  EnableTwoFactorDto,
  EnableTwoFactorResponse,
  ForgotPasswordDto,
  LoginDto,
  SessionLoginDto,
  SignUpDto,
  TwoFactorSetupResponse,
  TwoFactorStatusResponse,
  UserSession,
  VerifyTwoFactorLoginDto,
} from './auth.schemas';

export type * from './auth.schemas';
export * from './auth.schemas';

class AuthApi extends ApiModel {
  singUp = async (dto: SignUpDto) => {
    return await this.instance.post('/users/signup', dto);
  };

  confirmSignUp = async (token: string) => {
    return await this.instance.post('/users/sign-up/confirm', { token });
  };

  login = async ({ email, password }: LoginDto) => {
    const payload: SessionLoginDto = {
      emailOrNickname: email,
      password,
    };

    const { data } = await this.instance.post<{
      requiresTwoFactor?: boolean;
      twoFactorToken?: string;
    }>('/auth/session/login', payload);

    if (data.requiresTwoFactor && data.twoFactorToken) {
      return {
        data: {
          requiresTwoFactor: true as const,
          twoFactorToken: data.twoFactorToken,
        },
      };
    }

    return usersApi.getMe();
  };

  verifyTwoFactorLogin = async (dto: VerifyTwoFactorLoginDto) => {
    const { data } = await this.instance.post<{ user: User }>('/auth/session/verify-2fa', {
      twoFactorToken: dto.twoFactorToken,
      ...buildTwoFactorCodePayload(dto.code, dto.recoveryCode),
    });

    return { data: data.user };
  };

  getTwoFactorStatus = async () => {
    return await this.instance.get<TwoFactorStatusResponse>('/auth/2fa/status');
  };

  setupTwoFactor = async () => {
    return await this.instance.post<TwoFactorSetupResponse>('/auth/2fa/setup');
  };

  enableTwoFactor = async (dto: EnableTwoFactorDto) => {
    return await this.instance.post<EnableTwoFactorResponse>('/auth/2fa/enable', dto);
  };

  disableTwoFactor = async (dto: DisableTwoFactorDto) => {
    return await this.instance.post('/auth/2fa/disable', {
      password: dto.password.trim(),
      ...buildTwoFactorCodePayload(dto.code, dto.recoveryCode),
    });
  };

  logout = async () => {
    return await this.instance.post('/auth/session/logout');
  };

  findActiveSessions = async () => {
    return await this.instance.get<UserSession[]>('/auth/session');
  };

  revokeSession = async (sessionId: string) => {
    return await this.instance.delete(`/auth/session/${sessionId}`);
  };

  changePassword = async (dto: ChangePasswordDto) => {
    return await this.instance.post('/users/change-password', dto);
  };

  forgotPassword = async (dto: ForgotPasswordDto) => {
    return await this.instance.post('/users/forgot-password', dto);
  };

  confirmForgotPassword = async (dto: ConfirmForgotPasswordDto) => {
    return await this.instance.post('/users/reset-password', dto);
  };
}

export const authApi = new AuthApi();
export { AuthApi };
