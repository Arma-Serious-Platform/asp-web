import { makeAutoObservable } from 'mobx';

import { UserModel } from '@/entities/user/model';
import { LoginResponse, SideType, User, UserRole } from '@/shared/sdk/types';
import { deleteCookie, setCookie } from 'cookies-next';
import { Preloader } from '@/shared/model/loader';
import { api } from '@/shared/sdk';
import { getCookie } from 'cookies-next/client';
import { getTokensFromLocalStorage, setTokensToLocalStorage } from '@/shared/utils/session';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

export class SessionModel {
  constructor() {
    makeAutoObservable(this);
  }

  user = new UserModel();

  preloader = new Preloader(true);

  isAuthorized = false;

  get canAccessHeadquarters() {
    return this.user?.user?.squad && this.user?.user?.squad?.side?.type !== SideType.UNASSIGNED;
  }

  get isHasAdminPanelAccess() {
    return [UserRole.OWNER, UserRole.TECH_ADMIN].includes(this.user?.user?.role as UserRole);
  }

  boot = async () => {
    const { token, refreshToken } = getTokensFromLocalStorage();

    try {
      if (token && refreshToken) {
        await this.fetchMe();

        this.authorize();
      }
    } catch (error) {
      console.log(error, error.code, error.message);

      if (!(error instanceof AxiosError)) {
        toast('Час сесії сплинув');
      }

      if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
        toast.error("Не вдалося з'єднатися з сервером. Повторна спроба через 5 секунд...");

        setTimeout(async () => {
          await this.boot();
        }, 5000);

        return;
      }

      if (token) {
        this.logout();
        toast('Час сесії сплинув');
      }
    } finally {
      this.preloader.stop();
    }
  };

  fetchMe = async () => {
    const { data } = await api.getMe();

    this.user.user = data;

    if (!this.isAuthorized) {
      this.isAuthorized = true;
    }
  };

  authorize = async (dto?: LoginResponse) => {
    if (!dto) {
      this.isAuthorized = true;

      return;
    }

    setTokensToLocalStorage(dto.token, dto.refreshToken);
    this.isAuthorized = true;
    this.user.user = dto.user;
  };

  logout = () => {
    deleteCookie('token');
    deleteCookie('refreshToken');
    this.isAuthorized = false;
    this.user.user = null;
  };
}

export const session = new SessionModel();
