import { pickClosestWeekend } from '@/entities/weekend/lib';
import { WeekendModel } from '@/entities/weekend/model';
import { makeAutoObservable } from 'mobx';
import { Game } from '@/shared/sdk/types';
import dayjs from 'dayjs';

const today = () => dayjs().startOf('day');

export class IncomingWeekendsModel {
  constructor() {
    makeAutoObservable(this);
  }

  weekends = new WeekendModel();

  get weekend() {
    return pickClosestWeekend(this.weekends.pagination.data);
  }

  get upcomingGames(): Game[] {
    const weekend = this.weekend;
    if (!weekend?.games) return [];

    const now = today();

    return weekend.games
      .filter(game => {
        const gameDate = dayjs(game.date).startOf('day');
        return gameDate.isAfter(now) || gameDate.isSame(now);
      })
      .sort((a, b) => {
        const dateDiff = dayjs(a.date).valueOf() - dayjs(b.date).valueOf();
        if (dateDiff !== 0) return dateDiff;
        return a.position - b.position;
      })
      .slice(0, 2);
  }

  init = async () => {
    await this.weekends.pagination.loadAll({ published: true });
  };

  reset = () => {
    this.weekends.reset();
  };
}
