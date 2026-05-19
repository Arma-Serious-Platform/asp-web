import { Game, Weekend } from '@/shared/sdk/types';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

const today = () => dayjs().startOf('day');

export const isDateInCurrentWeek = (date: string | Date) => {
  const day = dayjs(date).startOf('day');
  const weekStart = dayjs().startOf('isoWeek');
  const weekEnd = dayjs().endOf('isoWeek');

  return !day.isBefore(weekStart, 'day') && !day.isAfter(weekEnd, 'day');
};

/** All games from loaded weekends that fall in the current calendar week (Mon–Sun). */
export const getGamesInCurrentWeek = (weekends: Weekend[]): Game[] =>
  weekends.flatMap(weekend => weekend.games ?? []).filter(game => isDateInCurrentWeek(game.date));

/**
 * Weekend whose nearest game (today or later) is soonest.
 * Falls back to the weekend with any game closest to today if none are upcoming.
 */
export const pickClosestWeekend = (weekends: Weekend[]): Weekend | null => {
  let closestUpcoming: { weekend: Weekend; daysUntil: number } | null = null;

  for (const weekend of weekends) {
    for (const game of weekend.games ?? []) {
      const daysUntil = dayjs(game.date).startOf('day').diff(today(), 'day');
      if (daysUntil < 0) continue;

      if (!closestUpcoming || daysUntil < closestUpcoming.daysUntil) {
        closestUpcoming = { weekend, daysUntil };
      }
    }
  }

  if (closestUpcoming) return closestUpcoming.weekend;

  let closestAny: { weekend: Weekend; distance: number } | null = null;

  for (const weekend of weekends) {
    for (const game of weekend.games ?? []) {
      const distance = Math.abs(dayjs(game.date).startOf('day').diff(today(), 'day'));
      if (!closestAny || distance < closestAny.distance) {
        closestAny = { weekend, distance };
      }
    }
  }

  return closestAny?.weekend ?? null;
};
