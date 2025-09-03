import { Pagination } from '@/shared/model/pagination';
import { api } from '@/shared/sdk';
import { SideType } from '@/shared/sdk/types';

import { get, makeAutoObservable } from 'mobx';

class SquadModel {
  constructor() {
    makeAutoObservable(this);
  }

  pagination = new Pagination({ api: api.findSquads });

  get blueSquads() {
    return this.pagination.data.filter(
      (squad) => squad.side?.type === SideType.BLUE
    );
  }

  get redSquads() {
    return this.pagination.data.filter(
      (squad) => squad.side?.type === SideType.RED
    );
  }

  get unassignedSquads() {
    return this.pagination.data.filter(
      (squad) => squad.side?.type === SideType.UNASSIGNED
    );
  }

  init = async () => {
    await this.pagination.loadAll();

    return this.pagination.data;
  };

  reset = () => {
    this.pagination.reset();
  };
}

export { SquadModel };
