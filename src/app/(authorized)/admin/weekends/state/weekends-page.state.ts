import { WeekendModel } from '@/entities/weekend/weekend.model';
import { weekendsApi } from '@/shared/sdk';
import { FindWeekendsDto, Weekend } from '@/shared/sdk/types';
import { Pagination } from '@/shared/state/pagination';
import { makeAutoObservable } from 'mobx';
import { ManageWeekendState } from './manage-weekends.state';

class WeekendsPageState {
  constructor() {
    makeAutoObservable(this);
  }

  pagination = new Pagination<Weekend, FindWeekendsDto, WeekendModel>({
    api: weekendsApi.findWeekends,
    Model: WeekendModel,
  });

  manageWeekend = new ManageWeekendState();
}

export const weekendsPageState = new WeekendsPageState();
