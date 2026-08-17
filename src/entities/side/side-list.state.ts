import { Pagination } from '@/shared/state/pagination';
import { sidesApi } from '@/shared/sdk';
import { FindSidesDto, Side } from '@/shared/sdk/types';
import { SideModel } from './side.model';
import { makeAutoObservable } from 'mobx';

class SidesState {
  constructor() {
    makeAutoObservable(this);
  }

  get options() {
    return this.pagination.data.map(side => ({
      label: side.name,
      value: side.id,
    }));
  }

  pagination = new Pagination<Side, FindSidesDto, SideModel>({
    api: sidesApi.findSides,
    Model: SideModel,
  });

  reset = () => {
    this.pagination.reset();
  };
}

export { SidesState };
