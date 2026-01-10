import { session } from "@/entities/session/model";
import { ChangeAvatarModel } from "@/features/user/change-avatar/model";
import { Loader } from "@/shared/model/loader";
import { api } from "@/shared/sdk";
import { UpdateUserDto } from "@/shared/sdk/types";
import { UserProfileModel } from "@/widgets/users/profile/model";

import { makeAutoObservable } from "mobx";
import toast from "react-hot-toast";

class ProfileModel {
  constructor() {
    makeAutoObservable(this);
  }

  init = async () => {
    if (!session.isAuthorized) return;

    await session.fetchMe();
  }

  socialsLoader = new Loader();

  avatar = new ChangeAvatarModel();

  profile = new UserProfileModel();

  get user() {
    return session.user.user;
  }

  updateUser = async (dto: UpdateUserDto) => {
    try {
      this.socialsLoader.start();
      await api.updateMe(dto);
      await session.fetchMe();
    } catch {
      toast.error('Не вдалося оновити соціальні мережі');
    } finally {
      this.socialsLoader.stop();
    }
  }
}

export const model = new ProfileModel();


