import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';
import { newsApi, usersApi } from '@/shared/sdk';
import { CreateNewsDto, News, UpdateNewsDto } from '@/shared/sdk/news/news.schemas';
import { User } from '@/shared/sdk/types';
import { Loader } from '@/shared/state/loader';
import { Visibility } from '@/shared/state/visibility';

export class ManageNewsState {
  loader = new Loader();
  authorsLoader = new Loader();
  authors: User[] = [];

  modal = new Visibility<{
    news?: News;
    mode: 'manage' | 'delete';
  }>();

  constructor() {
    makeAutoObservable(this);
  }

  loadAuthors = async () => {
    try {
      this.authorsLoader.start();
      const { data } = await usersApi.findUsers({ take: 200, skip: 0 });
      this.authors = data.data;
    } catch {
      // keep previous authors
    } finally {
      this.authorsLoader.stop();
    }
  };

  createNews = async (dto: CreateNewsDto, onSuccess?: (news: News) => void) => {
    try {
      this.loader.start();
      const { data } = await newsApi.createNews(dto);
      toast.success('Новину створено');
      this.modal.close();
      onSuccess?.(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Не вдалося створити новину');
    } finally {
      this.loader.stop();
    }
  };

  updateNews = async (dto: UpdateNewsDto, onSuccess?: (news: News) => void) => {
    try {
      this.loader.start();
      const { data } = await newsApi.updateNews(dto);
      toast.success('Новину оновлено');
      this.modal.close();
      onSuccess?.(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Не вдалося оновити новину');
    } finally {
      this.loader.stop();
    }
  };

  deleteNews = async (id: string, onSuccess?: () => void) => {
    try {
      this.loader.start();
      await newsApi.deleteNews(id);
      toast.success('Новину видалено');
      this.modal.close();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Не вдалося видалити новину');
    } finally {
      this.loader.stop();
    }
  };
}
