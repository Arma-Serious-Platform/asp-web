import { Loader } from '@/shared/state/loader';
import { Visibility } from '@/shared/state/visibility';
import { usersApi } from '@/shared/sdk';
import { User } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class AdminChangeNicknameState {
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
      const { data } = await usersApi.changeUserNickname({ userId, nickname });

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

export const adminChangeNicknameState = new AdminChangeNicknameState();
