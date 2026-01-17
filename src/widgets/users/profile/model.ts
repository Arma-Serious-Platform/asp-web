import { session } from '@/entities/session/model';
import { ChangeAvatarModel } from '@/features/user/change-avatar/model';
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

  get user() {
    return this.isOwnProfile ? session.user.user : this.otherUser;
  }

  init = async (userIdOrNickname?: string) => {
    try {
      this.loader.start();

      if (this.isOwnProfile) {
        await session.fetchMe();

        return;
      }

      const { data: otherUserData } = await api.getUserByIdOrNickname(userIdOrNickname || '');
      this.otherUser = otherUserData;
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося завантажити профіль користувача');
    } finally {
      this.loader.stop();
    }
  };

  updateUser = async (dto: UpdateUserDto) => {
    try {
      this.socialsLoader.start();
      await api.updateMe(dto);
      await this.init(this.user?.id || this.user?.nickname || '');
      await session.fetchMe();
    } catch {
      toast.error('Не вдалося оновити соціальні мережі');
    } finally {
      this.socialsLoader.stop();
    }
  };
}

export { UserProfileModel };
