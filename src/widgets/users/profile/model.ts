import { session } from '@/entities/session/model';
import { ChangeAvatarModel } from '@/features/user/change-avatar/model';
import { ChangeNicknameModel } from '@/features/user/change-nickname/model';
import { DisconnectSteamModel } from '@/features/user/disconnect-steam/model';
import { Loader } from '@/shared/model/loader';
import { api } from '@/shared/sdk';
import { UpdateUserDto, User } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

class UserProfileModel {
  constructor(isOwnProfile = true) {
    makeAutoObservable(this);

    this.isOwnProfile = isOwnProfile;
  }

  isOwnProfile: boolean;

  otherUser: User | null = null;
  loader = new Loader();
  socialsLoader = new Loader();
  avatar = new ChangeAvatarModel();
  nickname = new ChangeNicknameModel();
  steamDisconnect = new DisconnectSteamModel();

  get user() {
    return this.isOwnProfile ? session.user.user : this.otherUser;
  }

  init = async (userIdOrNickname?: string, options?: { refresh?: boolean }) => {
    const shouldFetchOwnProfile =
      this.isOwnProfile && !userIdOrNickname && (options?.refresh || !session.user.user);

    try {
      if (shouldFetchOwnProfile) {
        this.loader.start();
        await session.fetchMe();
      } else if (!this.isOwnProfile || userIdOrNickname) {
        this.loader.start();
        const { data: otherUserData } = await api.getUserByIdOrNickname(userIdOrNickname || '');
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
      await api.updateMe(dto);
      await this.init(undefined, { refresh: true });
    } catch {
      toast.error('Не вдалося оновити соціальні мережі');
    } finally {
      this.socialsLoader.stop();
    }
  };
}

export { UserProfileModel };
