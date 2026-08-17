import { WeekendModel } from '@/entities/weekend/weekend.model';
import { weekendsApi } from '@/shared/sdk';
import { FindWeekendsDto, Game, Weekend } from '@/shared/sdk/types';
import { Pagination } from '@/shared/state/pagination';
import { makeAutoObservable } from 'mobx';
import dayjs from 'dayjs';

const today = () => dayjs().startOf('day');

const pickClosestWeekend = (weekends: WeekendModel[]): Weekend | null => {
  let closestUpcoming: { weekend: Weekend; daysUntil: number } | null = null;

  for (const weekend of weekends) {
    for (const game of weekend.data.games ?? []) {
      const daysUntil = dayjs(game.date).startOf('day').diff(today(), 'day');
      if (daysUntil < 0) continue;

      if (!closestUpcoming || daysUntil < closestUpcoming.daysUntil) {
        closestUpcoming = { weekend: weekend.data, daysUntil };
      }
    }
  }

  if (closestUpcoming) return closestUpcoming.weekend;

  let closestAny: { weekend: Weekend; distance: number } | null = null;

  for (const weekend of weekends) {
    for (const game of weekend.data.games ?? []) {
      const distance = Math.abs(dayjs(game.date).startOf('day').diff(today(), 'day'));
      if (!closestAny || distance < closestAny.distance) {
        closestAny = { weekend: weekend.data, distance };
      }
    }
  }

  return closestAny?.weekend ?? null;
};

export class IncomingWeekendsState {
  constructor() {
    makeAutoObservable(this);
  }

  pagination = new Pagination<Weekend, FindWeekendsDto, WeekendModel>({
    api: weekendsApi.findWeekends,
    Model: WeekendModel,
  });

  get weekend() {
    return pickClosestWeekend(this.pagination.data);
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
    await this.pagination.loadAll({ published: true });
  };

  reset = () => {
    this.pagination.reset();
  };
}
