import { MissionStatus, MissionGameSide, MissionType, State } from '@/shared/sdk/types';

export const statusLabels: Record<MissionStatus, string> = {
  [MissionStatus.APPROVED]: 'Перевірено',
  [MissionStatus.PENDING_APPROVAL]: 'Очікує перевірки',
  [MissionStatus.CHANGES_REQUESTED]: 'Потребує змін',
  [MissionStatus.IN_REVIEW]: 'На перевірці',
  [MissionStatus.PENDING_GAME_APPROVAL]: 'Очікує ігрової перевірки',
};

export const statusColors: Record<MissionStatus, string> = {
  [MissionStatus.APPROVED]:
    'border border-green-500/50 bg-green-950/90 text-green-100 shadow-sm shadow-black/20',
  [MissionStatus.PENDING_APPROVAL]:
    'border border-amber-500/50 bg-amber-950/90 text-amber-100 shadow-sm shadow-black/20',
  [MissionStatus.CHANGES_REQUESTED]:
    'border border-red-500/50 bg-red-950/90 text-red-100 shadow-sm shadow-black/20',
  [MissionStatus.IN_REVIEW]:
    'border border-sky-500/50 bg-sky-950/90 text-sky-100 shadow-sm shadow-black/20',
  [MissionStatus.PENDING_GAME_APPROVAL]:
    'border border-violet-500/50 bg-violet-950/90 text-violet-100 shadow-sm shadow-black/20',
};

/** Text/icon color only (e.g. popover menu icons). */
export const statusTextColors: Record<MissionStatus, string> = {
  [MissionStatus.APPROVED]: 'text-green-300',
  [MissionStatus.PENDING_APPROVAL]: 'text-amber-200',
  [MissionStatus.CHANGES_REQUESTED]: 'text-red-300',
  [MissionStatus.IN_REVIEW]: 'text-sky-300',
  [MissionStatus.PENDING_GAME_APPROVAL]: 'text-violet-300',
};

export const sideTypeColors: Record<MissionGameSide, string> = {
  [MissionGameSide.BLUE]: 'text-blue-400',
  [MissionGameSide.RED]: 'text-red-400',
  [MissionGameSide.GREEN]: 'text-green-400',
};

export const statusOptions = [
  { label: 'Всі статуси', value: '' },
  { label: 'Перевірено', value: MissionStatus.APPROVED },
  { label: 'Очікує перевірки', value: MissionStatus.PENDING_APPROVAL },
  { label: 'На перевірці', value: MissionStatus.IN_REVIEW },
  { label: 'Очікує ігрової перевірки', value: MissionStatus.PENDING_GAME_APPROVAL },
  { label: 'Потребує змін', value: MissionStatus.CHANGES_REQUESTED },
];

export const missionTypeLabels: Record<MissionType, string> = {
  [MissionType.SG]: 'VTG',
  [MissionType.mini]: 'mVTG',
};

export const missionTypeOptions = [
  { label: 'Всі типи', value: '' },
  { label: missionTypeLabels[MissionType.SG], value: MissionType.SG },
  { label: missionTypeLabels[MissionType.mini], value: MissionType.mini },
];

export const stateLabels: Record<State, string> = {
  [State.ACTIVE]: 'Активні',
  [State.ARCHIVED]: 'Архівовані',
};

export const stateOptions = [
  { label: 'Всі стани', value: '' },
  { label: stateLabels[State.ACTIVE], value: State.ACTIVE },
  { label: stateLabels[State.ARCHIVED], value: State.ARCHIVED },
];
