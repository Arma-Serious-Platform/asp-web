import { createEntity } from '@/shared/state/entity';
import { UserSchema } from '@/shared/sdk/types';
import { makeObservable, computed } from 'mobx';
import { User, UserRole, UserStatus } from '@/shared/sdk/types';

class UserModel extends createEntity(UserSchema) {
  static roleLabels: Record<UserRole, string> = {
    [UserRole.OWNER]: 'Керівництво',
    [UserRole.SERVER_ADMIN]: 'Серверний адміністратор',
    [UserRole.TECH_ADMIN]: 'Тех. адміністратор',
    [UserRole.MISSION_REVIEWER]: 'Перевіряючий місій',
    [UserRole.UVK]: 'УВК',
    [UserRole.GAME_ADMIN]: 'Ігровий адміністратор',
    [UserRole.MINI_ADMIN]: 'mVTG адміністратор',
    [UserRole.USER]: 'Користувач',
  };

  private static roleRank: Record<UserRole, number> = {
    [UserRole.USER]: 0,
    [UserRole.MISSION_REVIEWER]: 0,
    [UserRole.MINI_ADMIN]: 1,
    [UserRole.GAME_ADMIN]: 2,
    [UserRole.TECH_ADMIN]: 3,
    [UserRole.UVK]: 4,
    [UserRole.SERVER_ADMIN]: 5,
    [UserRole.OWNER]: 6,
  };

  static hasAnyRole = (userRoles: UserRole[] | null | undefined, allowed: UserRole[]): boolean =>
    Boolean(userRoles?.some(role => allowed.includes(role)));

  static highestRole = (roles?: UserRole[] | null): UserRole => {
    if (!roles?.length) {
      return UserRole.USER;
    }

    return roles.reduce((best, role) =>
      UserModel.roleRank[role] > UserModel.roleRank[best] ? role : best,
    );
  };

  static getPrimaryDisplayRole = (roles?: UserRole[] | null): UserRole => {
    if (!roles?.length) {
      return UserRole.USER;
    }

    const highest = UserModel.highestRole(roles);
    if (highest !== UserRole.USER) {
      return highest;
    }

    if (roles.includes(UserRole.MISSION_REVIEWER)) {
      return UserRole.MISSION_REVIEWER;
    }

    return UserRole.USER;
  };

  static sortRolesByPriority = (roles: UserRole[]): UserRole[] =>
    [...roles].sort((a, b) => {
      const rankDiff = UserModel.roleRank[b] - UserModel.roleRank[a];
      if (rankDiff !== 0) return rankDiff;

      if (a === UserRole.MISSION_REVIEWER) return -1;
      if (b === UserRole.MISSION_REVIEWER) return 1;
      return 0;
    });

  static getRoleText = (roles?: UserRole[] | UserRole | null) => {
    const roleList = Array.isArray(roles) ? roles : roles ? [roles] : [];
    if (!roleList.length) {
      return UserModel.roleLabels[UserRole.USER];
    }

    return UserModel.sortRolesByPriority(roleList)
      .map(role => UserModel.roleLabels[role] ?? role)
      .join(', ');
  };

  static getRoleColor = (roles?: UserRole[] | UserRole | null) => {
    const roleList = Array.isArray(roles) ? roles : roles ? [roles] : [];
    const primary = UserModel.getPrimaryDisplayRole(roleList);

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

  static getStatusText = (status?: UserStatus) => {
    switch (status) {
      case UserStatus.BANNED:
        return 'Заблокований';
      case UserStatus.INVITED:
        return 'Запрошений';
      default:
        return 'Активний';
    }
  };

  static canAdminMission = (user: User) => {
    return UserModel.hasAnyRole(user.roles, [
      UserRole.OWNER,
      UserRole.SERVER_ADMIN,
      UserRole.UVK,
      UserRole.GAME_ADMIN,
    ]);
  };

  protected init() {
    makeObservable(this, {
      id: computed,
      nickname: computed,
      isOwnerOrTech: computed,
      isBanned: computed,
    });
  }

  get id() {
    return this.data.id;
  }

  get nickname() {
    return this.data.nickname;
  }

  get isOwnerOrTech() {
    return Boolean(
      this.data.roles?.includes(UserRole.OWNER) || this.data.roles?.includes(UserRole.TECH_ADMIN),
    );
  }

  get isBanned() {
    return this.data.status === UserStatus.BANNED;
  }
}

export { UserModel };
