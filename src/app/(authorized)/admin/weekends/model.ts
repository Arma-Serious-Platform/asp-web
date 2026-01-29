import { WeekendModel } from '@/entities/weekend/model';
import { ManageWeekendModel } from '@/features/weekends/manage/model';

import { makeAutoObservable } from 'mobx';

export class WeekendsModel {
  constructor() {
    makeAutoObservable(this);
  }

  weekend = new WeekendModel();

  manageWeekend = new ManageWeekendModel();
}

export const weekendsModel = new WeekendsModel();
