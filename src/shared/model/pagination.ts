import { AxiosResponse } from 'axios';
import { makeAutoObservable, reaction } from 'mobx';
import { PaginatedResponse } from '../sdk/types';
import { Preloader } from './loader';

type ApiFunction<P, T> = (
  params: P,
) => Promise<AxiosResponse<PaginatedResponse<T>>>;

type PaginationConstructor<T, P> = {
  api: ApiFunction<P, T>;

};

class Pagination<T, P, Y> {
  private api: ApiFunction<P, T>;
  public total = 0;
  public data: T[] = [];
  public canLoadMore = false;
  public params: P = {} as P;
  preloader = new Preloader();

  constructor({
    api,
  }: PaginationConstructor<T, P>) {
    makeAutoObservable(this);

    this.api = api;

    reaction(
      () => this.data.length,
      () => {
        this.canLoadMore = this.data.length < this.total;
      },
    );
  }

  setData = (data: T[]) => {
    this.data = data;
  }

  private setTotal = (total: number) => {
    this.total = total;
  }

  init = async (initialParams: P) => {
    try {
      this.preloader.start();

      const {
        data: { data, total, ...params },
      } = await this.api({ ...initialParams });

      this.setTotal(total);
      this.setData(data);
      this.params = { ...initialParams, ...params, };
    } catch (error) {
      console.log(error);
    } finally {
      this.preloader.stop();
    }
  };

  loadMore = async () => {
    try {
      this.preloader.start();

      const {
        data: { data, total, ...params },
      } = await this.api({ ...this.params, skip: this.data.length, });

      this.setTotal(total);
      this.setData([...this.data, ...data]);
      this.params = { ...this.params, ...params, skip: this.data.length };
    } catch (error) {
      console.log(error);
    } finally {
      this.preloader.stop();
    }
  };

  loadAll = async (params: P = {} as P, extraParams: P = {} as P) => {
    try {
      this.preloader.start();

      await this.init({
        ...params,
        take: 100,
        skip: 0,
        ...extraParams,
      } as P);

      while (this.data.length < this.total) {
        await this.loadMore();
      }
    } catch (error) {
      console.log(error);
    } finally {
      this.preloader.stop();
    }
  };

  refetch = async () => {
    try {
      this.preloader.start();

      const {
        data: { data, total, ...params },
      } = await this.api({ ...this.params });

      this.total = total;
      this.data = data;
      this.params = { ...this.params, ...params };
    } catch (error) {
      console.log(error);
    } finally {
      this.preloader.stop();
    }
  };

  reset = () => {
    this.total = 0;
    this.data = [];
  };
}

export { Pagination };
