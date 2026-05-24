import { SquadRole, User } from '@/shared/sdk/types';

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

const SQUAD_ROLE_ORDER: Record<SquadRole, number> = {
  [SquadRole.SUBLEADER]: 0,
  [SquadRole.HQ]: 1,
  [SquadRole.MEMBER]: 2,
  [SquadRole.RECRUIT]: 3,
};

export const sortSquadMembersByRole = (members: User[]) =>
  [...members].sort((a, b) => {
    const roleDiff =
      SQUAD_ROLE_ORDER[a.squadRole ?? SquadRole.MEMBER] - SQUAD_ROLE_ORDER[b.squadRole ?? SquadRole.MEMBER];

    if (roleDiff !== 0) return roleDiff;

    return (a.nickname ?? '').localeCompare(b.nickname ?? '', 'uk');
  });

export const getSquadSubleaders = (members: User[] = []) =>
  sortSquadMembersByRole(members).filter(member => member.squadRole === SquadRole.SUBLEADER);
