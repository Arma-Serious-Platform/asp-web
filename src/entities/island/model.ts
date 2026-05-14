import { Pagination } from '@/shared/model/pagination';
import { api } from '@/shared/sdk';

import { makeAutoObservable } from 'mobx';

export class IslandListModel {
  constructor() {
    makeAutoObservable(this);
  }

  pagination = new Pagination({ api: api.findIslandsPaginated });

  reset = () => {
    this.pagination.reset();
  };
}
