import { makeAutoObservable } from 'mobx';
import { newsApi } from '@/shared/sdk';
import { FindNewsDto, News } from '@/shared/sdk/news/news.schemas';
import { NewsModel } from '@/entities/news';
import { Pagination } from '@/shared/state/pagination';
import { ManageNewsState } from './manage-news.state';

class NewsPageState {
  manageNews = new ManageNewsState();

  pagination = new Pagination<News, FindNewsDto, NewsModel>({
    api: newsApi.findAdminNews,
    Model: NewsModel,
    initialParams: { take: 50, skip: 0 },
  });

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  load = (params?: FindNewsDto) => {
    return this.pagination.init(params);
  };
}

export const newsPageState = new NewsPageState();
