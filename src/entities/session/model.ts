import { makeAutoObservable } from "mobx";

import { UserModel } from "@/entities/user/model";
import { LoginResponse } from "@/shared/sdk/types";
import { deleteCookie, getCookie, setCookie } from "cookies-next";

export class SessionModel {
  constructor() {
    makeAutoObservable(this);
  }

  user = new UserModel();

  private setTokens = (token: string, refreshToken: string) => {
    setCookie("token", token, { maxAge: 60 * 60 * 24 * 7 });
    setCookie("refreshToken", refreshToken, { maxAge: 60 * 60 * 24 * 30 });
  }

  authorize = async (dto: LoginResponse) => {
    this.user.user = dto.user;

    this.setTokens(dto.token, dto.refreshToken);
  }

  logout = () => {
    this.user.user = null;

    deleteCookie("token");
    deleteCookie("refreshToken");
  }

  get isAuthorized() {
    const token = getCookie("token");
    const refreshToken = getCookie("refreshToken");

    return token !== undefined && refreshToken !== undefined;
  }
}

export const session = new SessionModel();