import dayjs from 'dayjs';
import toast from 'react-hot-toast';

import { HeadquartersGamePlan, HeadquartersSlot, SideType, Squad } from '@/shared/sdk/types';

export const ARCHIVE_PLANS_PAGE_SIZE = 4;
export const PLAN_LIST_SKELETON_COUNT = 8;

export type SlotDraftField = keyof Pick<HeadquartersSlot, 'name' | 'weaponry' | 'slotCount' | 'spawnPoint' | 'comment'>;
export type SlotDrafts = Record<string, Partial<Record<SlotDraftField, string>>>;
export type WantedSlotOverrides = Record<string, boolean>;
export type PlanTimeCategory = 'today' | 'future' | 'archive';

const weekDayByIndex: Record<number, string> = {
  0: 'Неділя',
  1: 'Понеділок',
  2: 'Вівторок',
  3: 'Середа',
  4: 'Четвер',
  5: "П'ятниця",
  6: 'Субота',
};

export const planListSkeletonPulse = 'animate-pulse rounded bg-zinc-600/35';

export const tableFieldTooltipContentClass =
  'block max-h-48 max-w-[min(24rem,85vw)] overflow-y-auto whitespace-pre-wrap wrap-break-word text-left';

export const normalizeSlotCount = (value: number | null | undefined) => (typeof value === 'number' ? value : 0);

export const joinSquadTags = (squads: Pick<Squad, 'tag'>[]) => squads.map(s => s.tag).join(', ');

export const areSamePayload = <T,>(a: T, b: T) => JSON.stringify(a) === JSON.stringify(b);

export const getPlanTimeCategory = (date?: string | null): PlanTimeCategory | null => {
  if (!date || !dayjs(date).isValid()) {
    return null;
  }

  const planDate = dayjs(date).startOf('day');
  const today = dayjs().startOf('day');

  if (planDate.isSame(today)) {
    return 'today';
  }

  if (planDate.isAfter(today)) {
    return 'future';
  }

  return 'archive';
};

export const sortPlansAscending = (a: HeadquartersGamePlan, b: HeadquartersGamePlan) =>
  dayjs(a.game?.date).valueOf() - dayjs(b.game?.date).valueOf();

export const sortPlansDescending = (a: HeadquartersGamePlan, b: HeadquartersGamePlan) =>
  dayjs(b.game?.date).valueOf() - dayjs(a.game?.date).valueOf();

export const getGameHumanLabel = (date?: string, position?: number) => {
  const normalizedPosition = typeof position === 'number' ? position + 1 : null;
  const dayIndex = date ? dayjs(date).day() : null;
  const weekDay = dayIndex !== null && weekDayByIndex[dayIndex] ? weekDayByIndex[dayIndex] : 'Гра';
  const datePart = date && dayjs(date).isValid() ? ` (${dayjs(date).format('DD.MM.YYYY')})` : '';

  if (normalizedPosition !== null) {
    return `${weekDay}, ${normalizedPosition}-а${datePart}`;
  }

  if (datePart) {
    return `${weekDay}${datePart}`;
  }

  return weekDay;
};

export const sideAppearance = (sideType?: SideType) => {
  if (sideType === SideType.RED) {
    return {
      dot: 'bg-red-500',
      text: 'text-red-400',
      badge: 'bg-red-500/20 text-red-400',
    };
  }

  if (sideType === SideType.BLUE) {
    return {
      dot: 'bg-blue-500',
      text: 'text-blue-400',
      badge: 'bg-blue-500/20 text-blue-400',
    };
  }

  return {
    dot: 'bg-zinc-500',
    text: 'text-zinc-300',
    badge: 'bg-zinc-500/20 text-zinc-300',
  };
};

export const copyToClipboard = async (text: string, options?: { successMessage?: string; emptyErrorMessage?: string }) => {
  const trimmed = text.trim();
  if (!trimmed) {
    toast.error(options?.emptyErrorMessage ?? 'Нічого копіювати');
    return;
  }

  try {
    await navigator.clipboard.writeText(trimmed);
    toast.success(options?.successMessage ?? 'Скопійовано');
  } catch {
    toast.error('Не вдалося скопіювати');
  }
};
