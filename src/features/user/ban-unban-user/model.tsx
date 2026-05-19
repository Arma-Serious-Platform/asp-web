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
      const { data } = await api.banUser(dto);

      onSuccess?.(data);

      toast.success(`${this.visibility.payload?.user?.nickname} був заблокований`);
      this.visibility.close();
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося заблокувати гравця');
    } finally {
      this.loader.stop();
    }
  }

  async permanentlyBanUser(userId: string, reason: string, onSuccess?: (user: User) => void) {
    try {
      this.loader.start();
      const { data } = await api.permanentlyBanUser(userId, reason);

      onSuccess?.(data);

      toast.success(`${this.visibility.payload?.user?.nickname} був заблокований назавжди`);
      this.visibility.close();
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося заблокувати гравця назавжди');
    } finally {
      this.loader.stop();
    }
  }

  async unbanUser(userId: string, reason?: string, onSuccess?: (user: User) => void) {
    try {
      this.loader.start();
      const { data } = await api.unbanUser(userId, reason);

      onSuccess?.(data);

      toast.success(`${this.visibility.payload?.user?.nickname} був розблокований`);
      this.visibility.close();
    } catch {
      toast.error('Не вдалося розблокувати гравця');
    } finally {
      this.loader.stop();
    }
  }
}

export const banUnbanUserModel = new BanUnbanUserModel();
