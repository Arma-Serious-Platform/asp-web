import { session } from "@/entities/session/model";
import { ChangeAvatarModel } from "@/features/user/change-avatar/model";

import { makeAutoObservable } from "mobx";

class ProfileModel {
  constructor() {
    makeAutoObservable(this);
  }

  init = async () => {
    if (!session.isAuthorized) return;

    await session.fetchMe();
  }

  avatar = new ChangeAvatarModel();

  get user() {
    return session.user.user;
  }
}

export const profile = new ProfileModel();


