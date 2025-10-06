import { Pagination } from '@/shared/model/pagination';
import { api } from '@/shared/sdk';

import { makeAutoObservable } from 'mobx';

export class SideModel {
  constructor() {
    makeAutoObservable(this);
  }

  get options() {
    return this.pagination.data.map((side) => ({
      label: side.name,
      value: side.id,
    }));
  }

  pagination = new Pagination({ api: api.findSides });

  reset = () => {
    this.pagination.reset();
  };
}
