import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import { User } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class AdminChangeNicknameModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  visibility = new Visibility<{
    user: User;
  }>();

  async changeNickname(nickname: string, onSuccess?: (user: User) => void) {
    const userId = this.visibility.payload?.user.id;

    if (!userId) return;

    try {
      this.loader.start();
      const { data } = await api.changeUserNickname({ userId, nickname });

      onSuccess?.(data);

      toast.success('Позивний змінено');
      this.visibility.close();
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося змінити позивний');
    } finally {
      this.loader.stop();
    }
  }
}

export const adminChangeNicknameModel = new AdminChangeNicknameModel();
