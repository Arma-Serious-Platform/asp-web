import { makeAutoObservable } from 'mobx';
import { newsApi } from '@/shared/sdk';
import { News } from '@/shared/sdk/news/news.schemas';
import { Loader } from '@/shared/state/loader';

class PublicNewsPageState {
  detailLoader = new Loader();
  current: News | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  loadById = async (id: string) => {
    try {
      this.detailLoader.start();
      this.current = null;
      const { data } = await newsApi.findNewsById(id);
      this.current = data;
    } catch (error) {
      console.error(error);
      this.current = null;
    } finally {
      this.detailLoader.stop();
    }
  };
}

export const publicNewsPageState = new PublicNewsPageState();
