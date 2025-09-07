import { makeAutoObservable } from "mobx";

import { UserModel } from "@/entities/user/model";
import { LoginResponse, UserRole } from '@/shared/sdk/types';
import { deleteCookie, setCookie } from 'cookies-next';
import { Preloader } from '@/shared/model/loader';
import { api } from "@/shared/sdk";

export class SessionModel {
  constructor() {
    makeAutoObservable(this);
  }

  user = new UserModel();

  preloader = new Preloader();

  isAuthorized = false;

  private setTokens = (token: string, refreshToken: string) => {
    setCookie("token", token, { maxAge: 60 * 60 * 24 * 7 });
    setCookie("refreshToken", refreshToken, { maxAge: 60 * 60 * 24 * 30 });
  }

  get isHasAdminPanelAccess() {
    return [UserRole.OWNER, UserRole.TECH_ADMIN].includes(this.user?.user?.role as UserRole);
  }

  boot = async (dto: LoginResponse | null) => {
    if (dto) {
      this.authorize({ ...dto });
    } else {
      this.preloader.stop();
    }
  }

  fetchMe = async () => {
    try {
      const { data } = await api.getMe();

      this.user.user = data;
    } catch (error) {
      console.error(error);
    }
  }

  authorize = async (dto: LoginResponse) => {
    this.isAuthorized = true;
    this.user.user = dto.user;
    this.setTokens(dto.token, dto.refreshToken);
  }

  logout = () => {
    this.isAuthorized = false;
    this.user.user = null;

    deleteCookie("token");
    deleteCookie("refreshToken");
  }
}

export const session = new SessionModel();