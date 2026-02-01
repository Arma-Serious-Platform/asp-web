import { WeekendModel } from '@/entities/weekend/model';
import { makeAutoObservable } from 'mobx';

export class IncomingWeekendsModel {
  constructor() {
    makeAutoObservable(this);
  }

  weekends = new WeekendModel();

  get weekend() {
    return this.weekends.pagination.data[0] ?? null;
  }

  init = async () => {
    await this.weekends.init({
      published: true,
      take: 1,
    });
  };

  reset = () => {
    this.weekends.reset();
  };
}
