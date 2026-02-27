import { WeekendModel } from '@/entities/weekend/model';
import { makeAutoObservable } from 'mobx';
import { Game } from '@/shared/sdk/types';
import dayjs from 'dayjs';

export class IncomingWeekendsModel {
  constructor() {
    makeAutoObservable(this);
  }

  weekends = new WeekendModel();

  get weekend() {
    return this.weekends.pagination.data[0] ?? null;
  }

  get upcomingGames(): Game[] {
    const weekend = this.weekend;
    if (!weekend?.games) return [];

    const now = dayjs().startOf('day');
    
    // Filter future games, sort by position, then by date
    const futureGames = weekend.games
      .filter(game => {
        const gameDate = dayjs(game.date).startOf('day');
        return gameDate.isAfter(now) || gameDate.isSame(now);
      })
      .sort((a, b) => {
        // First sort by position
        if (a.position !== b.position) {
          return a.position - b.position;
        }
        // Then by date
        return dayjs(a.date).valueOf() - dayjs(b.date).valueOf();
      })
      .slice(0, 2); // Max 2 games

    return futureGames;
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
