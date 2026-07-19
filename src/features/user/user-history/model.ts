import { Loader } from '@/shared/model/loader';
import { api } from '@/shared/sdk';
import { UserHistoryEvent } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class UserHistoryModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  events: UserHistoryEvent[] = [];

  async load(userId?: string) {
    if (!userId) return;

    try {
      this.loader.start();
      const { data } = await api.findUserHistory(userId);
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
