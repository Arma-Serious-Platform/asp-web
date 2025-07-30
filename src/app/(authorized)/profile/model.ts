import { session } from "@/entities/session/model";

import { makeAutoObservable } from "mobx";

class ProfileModel {
  constructor() {
    makeAutoObservable(this);
  }

  init = async () => {
    if (!session.isAuthorized) return;

    await session.fetchMe();
  }

  get user() {
    return session.user.user;
  }
}

export const profile = new ProfileModel();


