import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import { User } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class KickFromSquadModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  visibility = new Visibility<{
    user: User;
  }>();

  async kickUser(userId: string, onSuccess?: (user: User) => void) {
    try {
      this.loader.start();
      await api.kickFromSquad(userId);

      if (onSuccess && this.visibility.payload?.user) {
        onSuccess(this.visibility.payload.user);
      }

      toast.success(`${this.visibility.payload?.user?.nickname} був вилучений з загону`);
      this.visibility.close();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Не вдалося вилучити гравця з загону';
      toast.error(errorMessage);
    } finally {
      this.loader.stop();
    }
  }
}

export const kickFromSquadModel = new KickFromSquadModel();
