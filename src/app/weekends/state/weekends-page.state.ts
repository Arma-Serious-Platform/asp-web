'use client';

import { makeAutoObservable } from 'mobx';

import { WeekendModel } from '@/entities/weekend/weekend.model';
import { weekendsApi } from '@/shared/sdk';
import { FindWeekendsDto, Weekend } from '@/shared/sdk/types';
import { Pagination } from '@/shared/state/pagination';

class WeekendsPageState {
  constructor() {
    makeAutoObservable(this);
  }

  pagination = new Pagination<Weekend, FindWeekendsDto, WeekendModel>({
    api: weekendsApi.findWeekends,
    Model: WeekendModel,
  });

  init = async () => {
    await this.pagination.init({
      published: true,
      take: 4,
    });
  };

  reset = () => {
    this.pagination.reset();
  };
}

export const weekendsPageState = new WeekendsPageState();
