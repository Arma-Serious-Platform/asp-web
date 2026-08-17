import { Loader } from '@/shared/state/loader';
import { usersApi } from '@/shared/sdk';
import { UserHistoryEvent } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class UserHistoryState {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  events: UserHistoryEvent[] = [];

  async load(userId?: string) {
    if (!userId) return;

    try {
      this.loader.start();
      const { data } = await usersApi.findUserHistory(userId);
      this.events = data;
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося завантажити історію користувача');
      this.events = [];
    } finally {
      this.loader.stop();
    }
  }
}
