import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

/** Calendar day for a game/weekend date stored as UTC midnight or YYYY-MM-DD. */
export const toGameDate = (iso: string) => dayjs.utc(iso);

export const formatGameDate = (iso: string, template = 'DD.MM.YYYY') => toGameDate(iso).format(template);
