import { SquadRole } from '@/shared/sdk/types';

export const SQUAD_ROLE_LABELS: Record<SquadRole, string> = {
  [SquadRole.SUBLEADER]: 'Заступник',
  [SquadRole.HQ]: 'Штаб',
  [SquadRole.MEMBER]: 'Учасник',
  [SquadRole.RECRUIT]: 'Рекрут',
};

export const SQUAD_MEMBER_ROLE_OPTIONS = [
  { value: SquadRole.MEMBER, label: SQUAD_ROLE_LABELS[SquadRole.MEMBER] },
  { value: SquadRole.HQ, label: SQUAD_ROLE_LABELS[SquadRole.HQ] },
  { value: SquadRole.SUBLEADER, label: SQUAD_ROLE_LABELS[SquadRole.SUBLEADER] },
  { value: SquadRole.RECRUIT, label: SQUAD_ROLE_LABELS[SquadRole.RECRUIT] },
];

export const SQUAD_INVITE_ROLE_OPTIONS = [
  { value: SquadRole.MEMBER, label: SQUAD_ROLE_LABELS[SquadRole.MEMBER] },
  { value: SquadRole.RECRUIT, label: SQUAD_ROLE_LABELS[SquadRole.RECRUIT] },
];
