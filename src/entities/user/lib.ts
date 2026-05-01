import { UserRole, UserStatus } from '@/shared/sdk/types';

export const hasAccessToAdminPanel = (role?: UserRole) => {
  return [UserRole.OWNER, UserRole.TECH_ADMIN].includes(role as UserRole);
};

/** Ukrainian labels for roles (admin panel and display) */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.OWNER]: 'Керівництво',
  [UserRole.TECH_ADMIN]: 'Тех. адміністратор',
  [UserRole.GAME_ADMIN]: 'Ігровий адміністратор',
  [UserRole.MINI_ADMIN]: 'mVTG адміністратор',
  [UserRole.USER]: 'Користувач',
};

export const getUserRoleText = (role?: UserRole, isMissionReviewer?: boolean) => {
  if (role && USER_ROLE_LABELS[role]) {
    return USER_ROLE_LABELS[role];
  }
  if (isMissionReviewer) {
    return 'Перевіряючий місій';
  }
  return 'Користувач';
};

export const getUserRoleColor = (role?: UserRole, isMissionReviewer?: boolean) => {
  switch (role) {
    case UserRole.OWNER:
      return 'text-red-700';
    case UserRole.TECH_ADMIN:
      return 'text-purple-600';
    case UserRole.GAME_ADMIN:
      return 'text-red-500';
    case UserRole.MINI_ADMIN:
      return 'text-blue-500';
    case UserRole.USER:
      return 'text-neutral-400';
  }

  if (isMissionReviewer) {
    return 'text-amber-200';
  }

  return 'text-neutral-400';
};

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
