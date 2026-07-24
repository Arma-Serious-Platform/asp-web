import { FindUsersDto, User, UserRole, UserStatus } from '@/shared/sdk/types';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.OWNER]: 'Керівництво',
  [UserRole.SERVER_ADMIN]: 'Серверний адміністратор',
  [UserRole.TECH_ADMIN]: 'Тех. адміністратор',
  [UserRole.MISSION_REVIEWER]: 'Перевіряючий місій',
  [UserRole.UVK]: 'УВК',
  [UserRole.GAME_ADMIN]: 'Ігровий адміністратор',
  [UserRole.MINI_ADMIN]: 'mVTG адміністратор',
  [UserRole.USER]: 'Користувач',
};

const ROLE_RANK: Record<UserRole, number> = {
  [UserRole.USER]: 0,
  [UserRole.MISSION_REVIEWER]: 0,
  [UserRole.MINI_ADMIN]: 1,
  [UserRole.GAME_ADMIN]: 2,
  [UserRole.TECH_ADMIN]: 3,
  [UserRole.UVK]: 4,
  [UserRole.SERVER_ADMIN]: 5,
  [UserRole.OWNER]: 6,
};

export const hasAnyRole = (userRoles: UserRole[] | null | undefined, allowed: UserRole[]): boolean =>
  Boolean(userRoles?.some(role => allowed.includes(role)));

export const highestRole = (roles?: UserRole[] | null): UserRole => {
  if (!roles?.length) {
    return UserRole.USER;
  }

  return roles.reduce((best, role) => (ROLE_RANK[role] > ROLE_RANK[best] ? role : best));
};

export const getPrimaryDisplayRole = (roles?: UserRole[] | null): UserRole => {
  if (!roles?.length) {
    return UserRole.USER;
  }

  const highest = highestRole(roles);
  if (highest !== UserRole.USER) {
    return highest;
  }

  if (roles.includes(UserRole.MISSION_REVIEWER)) {
    return UserRole.MISSION_REVIEWER;
  }

  return UserRole.USER;
};

export const getUserRoleText = (roles?: UserRole[] | UserRole | null) => {
  const roleList = Array.isArray(roles) ? roles : roles ? [roles] : [];
  const primary = getPrimaryDisplayRole(roleList);

  return USER_ROLE_LABELS[primary] ?? 'Користувач';
};

export const getUserRoleColor = (roles?: UserRole[] | UserRole | null) => {
  const roleList = Array.isArray(roles) ? roles : roles ? [roles] : [];
  const primary = getPrimaryDisplayRole(roleList);

  switch (primary) {
    case UserRole.OWNER:
      return 'text-red-700';
    case UserRole.SERVER_ADMIN:
      return 'text-orange-600';
    case UserRole.TECH_ADMIN:
      return 'text-purple-600';
    case UserRole.UVK:
      return 'text-emerald-500';
    case UserRole.MISSION_REVIEWER:
      return 'text-amber-200';
    case UserRole.GAME_ADMIN:
      return 'text-red-500';
    case UserRole.MINI_ADMIN:
      return 'text-blue-500';
    case UserRole.USER:
      return 'text-neutral-400';
    default:
      return 'text-neutral-400';
  }
};

export const findUsersWithoutSquadParams = (params: Partial<FindUsersDto> = {}): FindUsersDto => ({
  hasSquad: false,
  take: 50,
  skip: 0,
  ...params,
});

/** Query params for mission author filter — only users who have created at least one mission. */
export const findUsersWithMissionParams = (params: Partial<FindUsersDto> = {}): FindUsersDto => ({
  hasMission: true,
  take: 50,
  skip: 0,
  ...params,
});

/** Query params for mission reviewer filter — only users who can review mission versions. */
export const findMissionReviewersParams = (params: Partial<FindUsersDto> = {}): FindUsersDto => ({
  canReviewMissions: true,
  take: 50,
  skip: 0,
  ...params,
});

export const getUserStatusText = (status?: UserStatus) => {
  switch (status) {
    case UserStatus.BANNED:
      return 'Заблокований';
    case UserStatus.INVITED:
      return 'Запрошений';
    default:
      return 'Активний';
  }
};

export const canAdminMission = (user: User) => {
  return hasAnyRole(user.roles, [UserRole.OWNER, UserRole.SERVER_ADMIN, UserRole.UVK, UserRole.GAME_ADMIN]);
};
