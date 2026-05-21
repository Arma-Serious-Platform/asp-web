import { FindUsersDto, User, UserRole, UserStatus } from '@/shared/sdk/types';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.OWNER]: 'Керівництво',
  [UserRole.SERVER_ADMIN]: 'Серверний адміністратор',
  [UserRole.TECH_ADMIN]: 'Тех. адміністратор',
  [UserRole.UVK]: 'УВК',
  [UserRole.GAME_ADMIN]: 'Ігровий адміністратор',
  [UserRole.MINI_ADMIN]: 'mVTG адміністратор',
  [UserRole.USER]: 'Користувач',
};

export const getUserRoleText = (role?: UserRole, isMissionReviewer?: boolean) => {
  if (isMissionReviewer && (!role || role === UserRole.USER)) {
    return 'Перевіряючий місій';
  }

  if (role && USER_ROLE_LABELS[role]) {
    return USER_ROLE_LABELS[role];
  }

  return 'Користувач';
};

export const getUserRoleColor = (role?: UserRole, isMissionReviewer?: boolean) => {
  if (isMissionReviewer && (!role || role === UserRole.USER)) {
    return 'text-amber-200';
  }

  switch (role) {
    case UserRole.OWNER:
      return 'text-red-700';
    case UserRole.SERVER_ADMIN:
      return 'text-orange-600';
    case UserRole.TECH_ADMIN:
      return 'text-purple-600';
    case UserRole.UVK:
      return 'text-emerald-500';
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
  return [UserRole.OWNER, UserRole.SERVER_ADMIN, UserRole.UVK, UserRole.GAME_ADMIN].includes(user.role);
};
