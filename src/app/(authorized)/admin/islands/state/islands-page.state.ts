import { IslandModel } from '@/entities/island/island.model';
import { islandsApi } from '@/shared/sdk';
import { FindIslandsDto, Island } from '@/shared/sdk/types';
import { Pagination } from '@/shared/state/pagination';
import { makeAutoObservable } from 'mobx';
import { ManageIslandState } from './manage-islands.state';

class IslandsPageState {
  constructor() {
    makeAutoObservable(this);
  }

  pagination = new Pagination<Island, FindIslandsDto, IslandModel>({
    api: islandsApi.findIslandsPaginated,
    Model: IslandModel,
  });

  manageIsland = new ManageIslandState();
}

export const islandsPageState = new IslandsPageState();
