import { UserRole, UserStatus } from "@/shared/sdk/types";

export const getUserRoleText = (role?: UserRole) => {
  switch (role) {
    case UserRole.OWNER:
      return 'Адміністратор';
    case UserRole.TECH_ADMIN:
      return 'Технічний адміністратор';
    case UserRole.GAME_ADMIN:
      return 'Ігровий адміністратор';
    default:
      return 'Користувач';
  }
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
