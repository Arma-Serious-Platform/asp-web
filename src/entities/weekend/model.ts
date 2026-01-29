import { Pagination } from '@/shared/model/pagination';
import { api } from '@/shared/sdk';
import { FindWeekendsDto } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';

export class WeekendModel {
  constructor() {
    makeAutoObservable(this);
  }

  pagination = new Pagination({
    api: api.findWeekends,
  });

  init = async (dto: FindWeekendsDto) => {
    await this.pagination.init(dto);

    return this.pagination.data;
  };

  reset = () => {
    this.pagination.reset();
  };
}
