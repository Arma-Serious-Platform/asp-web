import { session } from '@/entities/session/session.state';
import { UserAdminActionsState } from '@/app/(authorized)/admin/users/state/admin-actions.state';
import { ChangeAvatarState } from './change-avatar.state';
import { ChangeNicknameState } from './change-nickname.state';
import { DisconnectSteamState } from './disconnect-steam.state';
import { Loader } from '@/shared/state/loader';
import { usersApi } from '@/shared/sdk';
import { UpdateUserDto, User } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

class UserProfileState {
  constructor(isOwnProfile = true) {
    makeAutoObservable(this);

    this.isOwnProfile = isOwnProfile;
  }

  isOwnProfile: boolean;

  otherUser: User | null = null;
  loader = new Loader();
  socialsLoader = new Loader();
  avatar = new ChangeAvatarState();
  nickname = new ChangeNicknameState();
  steamDisconnect = new DisconnectSteamState();
  adminActions = new UserAdminActionsState();

  get user() {
    return this.isOwnProfile ? session.user?.data : this.otherUser;
  }

  init = async (userIdOrNickname?: string, options?: { refresh?: boolean }) => {
    const shouldFetchOwnProfile = this.isOwnProfile && !userIdOrNickname;

    try {
      if (shouldFetchOwnProfile) {
        this.loader.start();
        await session.fetchMe();
      } else if (!this.isOwnProfile || userIdOrNickname) {
        this.loader.start();
        const { data: otherUserData } = await usersApi.getUserByIdOrNickname(userIdOrNickname || '');
        this.otherUser = otherUserData;
      }
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося завантажити профіль користувача');
    } finally {
      if (shouldFetchOwnProfile || !this.isOwnProfile || userIdOrNickname) {
        this.loader.stop();
      }
    }
  };

  updateUser = async (dto: UpdateUserDto) => {
    try {
      this.socialsLoader.start();
      await usersApi.updateMe(dto);
      await this.init(undefined, { refresh: true });
    } catch {
      toast.error('Не вдалося оновити соціальні мережі');
    } finally {
      this.socialsLoader.stop();
    }
  };
}

export { UserProfileState };
