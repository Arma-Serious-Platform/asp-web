import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

/** Calendar day for a game/weekend date stored as UTC midnight or YYYY-MM-DD. */
export const toGameDate = (iso: string) => dayjs.utc(iso);

export const formatGameDate = (iso: string, template = 'DD.MM.YYYY') => toGameDate(iso).format(template);

/** Upcoming weekday including today (0 = Sunday … 6 = Saturday). */
export const getUpcomingWeekday = (targetDay: number) => {
  const today = dayjs().startOf('day');
  const delta = (targetDay - today.day() + 7) % 7;
  return today.add(delta, 'day');
};

export const getDefaultWeekendAnnouncementName = () => {
  const friday = getUpcomingWeekday(5).format('DD.MM.YYYY');
  const sunday = getUpcomingWeekday(0).format('DD.MM.YYYY');
  return `Анонс ігор VTG ${friday} та ${sunday}`;
};

/** YYYY-MM-DD for DateInput: games 1–2 Friday, 3–4 Sunday, later empty. */
export const getDefaultGameDateByIndex = (index: number) => {
  if (index <= 1) return getUpcomingWeekday(5).format('YYYY-MM-DD');
  if (index <= 3) return getUpcomingWeekday(0).format('YYYY-MM-DD');
  return '';
};
