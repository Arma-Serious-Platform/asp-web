import { Loader } from '@/shared/state/loader';
import { usersApi } from '@/shared/sdk';
import { ActiveUserWarnings } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

const emptyWarnings: ActiveUserWarnings = {
  count: 0,
  limit: 3,
  ban: null,
  items: [],
};

export class ActiveWarningsState {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  summary: ActiveUserWarnings = emptyWarnings;

  async load(userId?: string) {
    if (!userId) return;

    try {
      this.loader.start();
      const { data } = await usersApi.findActiveUserWarnings(userId);
      this.summary = data;
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося завантажити попередження');
      this.summary = emptyWarnings;
    } finally {
      this.loader.stop();
    }
  }
}
