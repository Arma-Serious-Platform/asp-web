import { Pagination } from '@/shared/state/pagination';
import { islandsApi } from '@/shared/sdk';
import { FindIslandsDto, Island } from '@/shared/sdk/types';
import { IslandModel } from './island.model';
import { makeAutoObservable } from 'mobx';

export class IslandListState {
  constructor() {
    makeAutoObservable(this);
  }

  pagination = new Pagination<Island, FindIslandsDto, IslandModel>({
    api: islandsApi.findIslandsPaginated,
    Model: IslandModel,
  });

  reset = () => {
    this.pagination.reset();
  };
}

export { IslandModel } from './island.model';
