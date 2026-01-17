import { UserRole, UserStatus } from '@/shared/sdk/types';

export const hasAccessToAdminPanel = (role?: UserRole) => {
  return [UserRole.OWNER, UserRole.TECH_ADMIN].includes(role as UserRole);
};

export const getUserRoleText = (role?: UserRole, isMissionReviewer?: boolean) => {
  switch (role) {
    case UserRole.OWNER:
      return 'Адміністратор';
    case UserRole.TECH_ADMIN:
      return 'Технічний адміністратор';
    case UserRole.GAME_ADMIN:
      return 'Ігровий адміністратор';
    default:
      if (isMissionReviewer) {
        return 'Перевіряючий місій';
      }

      return 'Користувач';
  }
};

export const getUserRoleColor = (role?: UserRole, isMissionReviewer?: boolean) => {
  switch (role) {
    case UserRole.OWNER:
      return 'text-red-700';
    case UserRole.TECH_ADMIN:
      return 'text-purple-600';
    case UserRole.GAME_ADMIN:
      return 'text-red-500';
  }

  if (isMissionReviewer) {
    return 'text-amber-200';
  }

  return 'text-neutral-400-500';
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
