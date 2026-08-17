import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { makeAutoObservable, runInAction } from 'mobx';

import type { PaginatedRequest, PaginatedResponse } from '@/shared/sdk/api-model';

import { Loader } from './loader';

type ApiFunction<TParams extends PaginatedRequest, TData> = (
  params: TParams,
  config?: AxiosRequestConfig,
) => Promise<AxiosResponse<PaginatedResponse<TData>> | PaginatedResponse<TData>>;

type ModelClass<TData, TModel> = new (data: TData) => TModel;

type PaginationConstructor<TData, TParams extends PaginatedRequest, TModel> = {
  api: ApiFunction<TParams, TData>;
  Model: ModelClass<TData, TModel>;
  initialParams?: TParams;
};

const unwrapPage = <TData>(
  result: AxiosResponse<PaginatedResponse<TData>> | PaginatedResponse<TData>,
): PaginatedResponse<TData> => {
  // Axios responses expose the body on `.data`; body itself has `.data` (items array).
  if (result && typeof result === 'object' && 'data' in result) {
    const body = (result as AxiosResponse<PaginatedResponse<TData>>).data;
    if (body && typeof body === 'object' && Array.isArray((body as PaginatedResponse<TData>).data)) {
      return body as PaginatedResponse<TData>;
    }
    // Already a PaginatedResponse
    if (Array.isArray((result as PaginatedResponse<TData>).data)) {
      return result as PaginatedResponse<TData>;
    }
  }

  return { data: [], total: 0, take: 0, skip: 0 };
};

class Pagination<TData, TParams extends PaginatedRequest = PaginatedRequest, TModel = TData> {
  #api: ApiFunction<TParams, TData>;
  #Model: ModelClass<TData, TModel>;
  private initalParams: TParams;
  total = 0;
  params: TParams;
  data: TModel[] = [];

  loader = new Loader();

  /** @deprecated Use `loader` — kept for existing UI call sites */
  get preloader() {
    return this.loader;
  }

  private lastRequestId = 0;

  constructor({ api, Model, initialParams }: PaginationConstructor<TData, TParams, TModel>) {
    this.#api = api;
    this.#Model = Model;
    this.initalParams = initialParams || ({} as TParams);
    this.params = initialParams || ({} as TParams);
    this.data = [];

    makeAutoObservable(this);
  }

  get canLoadMore() {
    return this.data.length < this.total;
  }

  setParams = (params: TParams) => {
    this.params = params;
  };

  private toModels = (items: TData[]): TModel[] => {
    if (!Array.isArray(items)) return [];

    return items.map(item => new this.#Model(item));
  };

  private getItemId = (item: TModel): string | number | undefined => {
    if (!item || typeof item !== 'object') return undefined;

    if ('id' in item) {
      return item.id as string | number;
    }

    if ('data' in item && item.data && typeof item.data === 'object' && 'id' in item.data) {
      return item.data.id as string | number;
    }

    return undefined;
  };

  init = async (extraParams: TParams = {} as TParams, options?: { merge?: boolean; config?: AxiosRequestConfig }) => {
    try {
      const requestId = ++this.lastRequestId;
      this.loader.add();

      if (options?.config?.signal?.aborted) return;

      const initParams = options?.merge ? { ...this.params } : {};

      const page = unwrapPage(
        await this.#api({ ...initParams, skip: 0, ...extraParams }, options?.config),
      );
      const { data, total, ...params } = page;

      runInAction(() => {
        if (requestId !== this.lastRequestId || options?.config?.signal?.aborted) return;

        this.total = total;
        this.data = this.toModels(data);
        this.params = { ...this.initalParams, ...params, ...extraParams };
      });
    } catch (error) {
      if (options?.config?.signal?.aborted) return;
      console.log(error);
    } finally {
      this.loader.remove();
    }
  };

  loadMore = async (options?: { config?: AxiosRequestConfig; generation?: number }) => {
    const gen = options?.generation ?? this.lastRequestId;

    if (gen !== this.lastRequestId || options?.config?.signal?.aborted) return;

    try {
      this.loader.add();

      const page = unwrapPage(
        await this.#api({ ...this.params, skip: this.data.length } as TParams, options?.config),
      );
      const { data, total, ...params } = page;

      runInAction(() => {
        if (gen !== this.lastRequestId || options?.config?.signal?.aborted) return;

        this.total = total;
        this.data = [...this.data, ...this.toModels(data)];
        this.params = { ...this.params, ...params };
      });
    } catch (error) {
      if (options?.config?.signal?.aborted) return;
      console.log(error);
    } finally {
      this.loader.remove();
    }
  };

  loadAll = async (
    params: TParams = {} as TParams,
    extraParams: TParams = {} as TParams,
    merge = true,
    options?: AxiosRequestConfig,
  ) => {
    try {
      this.loader.add();

      await this.init(
        {
          ...params,
          take: 100,
          skip: 0,
          ...extraParams,
        } as TParams,
        { merge, ...options },
      );

      const generation = this.lastRequestId;

      if (generation !== this.lastRequestId || options?.signal?.aborted) return;

      while (this.data.length < this.total) {
        if (generation !== this.lastRequestId || options?.signal?.aborted) break;

        await this.loadMore({ ...options, generation });
      }
    } catch (error) {
      if (options?.signal?.aborted) return;
      console.log(error);
    } finally {
      this.loader.remove();
    }
  };

  refetch = async () => {
    try {
      this.loader.add();

      const page = unwrapPage(await this.#api(this.params));
      const { data, total, ...params } = page;

      this.total = total;
      this.data = this.toModels(data);
      this.params = { ...this.params, ...params };
    } catch (error) {
      console.log(error);
    } finally {
      this.loader.remove();
    }
  };

  addData = (data: TModel | TData, index?: number) => {
    const model = data instanceof this.#Model ? data : new this.#Model(data as TData);

    if (index !== undefined) {
      this.data.splice(index, 0, model);
    } else {
      this.data = [model, ...this.data];
    }

    this.total++;
  };

  setData = (data: TModel[]) => {
    this.data = data;
  };

  updateData = (data: TModel | TData, index: number) => {
    const model = data instanceof this.#Model ? data : new this.#Model(data as TData);
    const newData = [...this.data];
    newData[index] = model;

    this.data = [...newData];
  };

  removeData = (id: string | number) => {
    this.data = this.data.filter(item => this.getItemId(item) !== id);

    this.total--;

    if (
      this.params &&
      typeof this.params === 'object' &&
      'skip' in this.params &&
      typeof this.params.skip === 'number' &&
      this.params.skip > 0
    ) {
      this.params.skip = Number(this.params.skip) - 1;
    }
  };

  reset = () => {
    this.total = 0;
    this.data = [];
    this.params = { ...this.initalParams };
  };
}

export { Pagination };
