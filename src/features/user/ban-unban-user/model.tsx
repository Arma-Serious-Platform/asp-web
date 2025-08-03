import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import { BanUserDto, User } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class BanUnbanUserModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  visibility = new Visibility<{
    user: User;
  }>();

  async banUser(dto: BanUserDto, onSuccess?: (user: User) => void) {
    try {
      this.loader.start();
      await api.banUser(dto);

      if (onSuccess && this.visibility.payload?.user) {
        onSuccess(this.visibility.payload.user);
      }

      toast.success(
        `${this.visibility.payload?.user?.nickname} був заблокований`
      );
      this.visibility.close();
    } catch {
      toast.error('Не вдалося заблокувати гравця');
    } finally {
      this.loader.stop();
    }
  }

  async unbanUser(userId: string, onSuccess?: (user: User) => void) {
    try {
      this.loader.start();
      await api.unbanUser(userId);

      if (onSuccess && this.visibility.payload?.user) {
        onSuccess(this.visibility.payload.user);
      }

      toast.success(
        `${this.visibility.payload?.user?.nickname} був розблокований`
      );
      this.visibility.close();
    } catch {
      toast.error('Не вдалося розблокувати гравця');
    } finally {
      this.loader.stop();
    }
  }
}

export const banUnbanUserModel = new BanUnbanUserModel();
