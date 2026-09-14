import { makeAutoObservable } from 'mobx';
import { newsApi } from '@/shared/sdk';
import { FindNewsDto, News } from '@/shared/sdk/news/news.schemas';
import { NewsModel } from '@/entities/news';
import { Pagination } from '@/shared/state/pagination';
import { Loader } from '@/shared/state/loader';

class PublicNewsPageState {
  pagination = new Pagination<News, FindNewsDto, NewsModel>({
    api: newsApi.findNews,
    Model: NewsModel,
    initialParams: { take: 20, skip: 0 },
  });

  detailLoader = new Loader();
  current: News | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  loadList = (params?: FindNewsDto) => {
    return this.pagination.init(params);
  };

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
