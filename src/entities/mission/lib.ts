import { MissionStatus, MissionGameSide } from '@/shared/sdk/types';

export const statusLabels: Record<MissionStatus, string> = {
  [MissionStatus.APPROVED]: 'Перевірено',
  [MissionStatus.PENDING_APPROVAL]: 'Очікує перевірки',
  [MissionStatus.CHANGES_REQUESTED]: 'Потребує змін',
};

export const statusColors: Record<MissionStatus, string> = {
  [MissionStatus.APPROVED]: 'bg-green-500/20 text-green-400 border-green-500/30',
  [MissionStatus.PENDING_APPROVAL]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  [MissionStatus.CHANGES_REQUESTED]: 'bg-red-500/20 text-red-400 border-red-500/30',
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
  { label: 'Потребує змін', value: MissionStatus.CHANGES_REQUESTED },
];
