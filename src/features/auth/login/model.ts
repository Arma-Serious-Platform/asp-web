import { session } from "@/entities/session/model";
import { api } from "@/shared/sdk";
import { LoginDto } from "@/shared/sdk/types";
import { makeAutoObservable } from "mobx";

class LoginModel {
  constructor() {
    makeAutoObservable(this);
  }

  login = async (dto: LoginDto) => {
    const { data: response } = await api.login(dto);

    session.authorize(response);

    return response;
  }
}

const loginModel = new LoginModel();

export { loginModel, LoginModel };
