import { session } from '@/entities/session/session.state';
import { ChangeAvatarState } from './change-avatar.state';
import { Loader } from '@/shared/state/loader';
import { usersApi } from '@/shared/sdk';
import { UpdateUserDto } from '@/shared/sdk/types';
import { UserProfileState } from './user-profile.state';

import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

class ProfilePageState {
  constructor() {
    makeAutoObservable(this);
  }

  socialsLoader = new Loader();

  avatar = new ChangeAvatarState();

  profile = new UserProfileState();

  get user() {
    return session.user?.data;
  }

  updateUser = async (dto: UpdateUserDto) => {
    try {
      this.socialsLoader.start();
      await usersApi.updateMe(dto);
      await session.fetchMe();
    } catch {
      toast.error('Не вдалося оновити соціальні мережі');
    } finally {
      this.socialsLoader.stop();
    }
  };
}

export const profilePageState = new ProfilePageState();
