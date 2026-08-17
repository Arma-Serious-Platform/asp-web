import { Pagination } from '@/shared/state/pagination';
import { squadsApi } from '@/shared/sdk';
import { FindSquadsDto, SideType, Squad } from '@/shared/sdk/types';
import { SquadModel } from './squad.model';
import { makeAutoObservable } from 'mobx';

class SquadsState {
  constructor() {
    makeAutoObservable(this);
  }

  pagination = new Pagination({
    api: squadsApi.findSquads,
    Model: SquadModel,
  });

  get blueSquads() {
    return this.pagination.data.filter(squad => squad.sideType === SideType.BLUE);
  }

  get redSquads() {
    return this.pagination.data.filter(squad => squad.sideType === SideType.RED);
  }

  get unassignedSquads() {
    return this.pagination.data.filter(squad => squad.sideType === SideType.UNASSIGNED);
  }

  init = async () => {
    await this.pagination.loadAll();
    return this.pagination.data;
  };

  reset = () => {
    this.pagination.reset();
  };
}

export { SquadsState };
