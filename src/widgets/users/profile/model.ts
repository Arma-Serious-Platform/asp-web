import { session } from '@/entities/session/model';
import { ChangeAvatarModel } from '@/features/user/change-avatar/model';
import { Loader } from '@/shared/model/loader';
import { api } from '@/shared/sdk';
import { UpdateUserDto, User } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

class UserProfileModel {
  constructor() {
    makeAutoObservable(this);
  }

  user: User | null = null;
  loader = new Loader();
  socialsLoader = new Loader();
  avatar = new ChangeAvatarModel();

  get isOwnProfile() {
    return this.user?.id === session.user.user?.id;
  }

  init = async (userIdOrNickname: string) => {
    try {
      this.loader.start();
      const { data } = await api.getUserByIdOrNickname(userIdOrNickname);
      this.user = data;
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

