import { makeAutoObservable } from 'mobx';

import { UserModel } from '@/entities/user/model';
import { LoginResponse, User, UserRole } from '@/shared/sdk/types';
import { deleteCookie, setCookie } from 'cookies-next';
import { Preloader } from '@/shared/model/loader';
import { api } from '@/shared/sdk';
import { getCookie } from 'cookies-next/client';

export class SessionModel {
  constructor() {
    makeAutoObservable(this);
  }

  user = new UserModel();

  preloader = new Preloader(true);

  isAuthorized = false;

  private setTokens = (token: string, refreshToken: string) => {
    setCookie('token', token, { maxAge: 60 * 60 * 24 * 7 });
    setCookie('refreshToken', refreshToken, { maxAge: 60 * 60 * 24 * 30 });
  };

  get isHasAdminPanelAccess() {
    return [UserRole.OWNER, UserRole.TECH_ADMIN].includes(
      this.user?.user?.role as UserRole
    );
  }

  boot = async () => {
    const token = getCookie('token');
    const refreshToken = getCookie('refreshToken');

    try {
      if (token && refreshToken) {
        await this.fetchMe();

        this.authorize();
      }
    } catch {
    } finally {
      this.preloader.stop();
    }
  };

  fetchMe = async () => {
    try {
      const { data } = await api.getMe();

      this.user.user = data;
      if (!this.isAuthorized) {
        this.isAuthorized = true;
      }
    } catch (error) {
      console.error(error);
    }
  };

  authorize = async (dto?: LoginResponse) => {
    if (!dto) {
      this.isAuthorized = true;

      return;
    }

    this.isAuthorized = true;
    this.user.user = dto.user;
    this.setTokens(dto.token, dto.refreshToken);
  };

  logout = () => {
    deleteCookie('token');
    deleteCookie('refreshToken');
    this.isAuthorized = false;
    this.user.user = null;
  };
}

export const session = new SessionModel();
