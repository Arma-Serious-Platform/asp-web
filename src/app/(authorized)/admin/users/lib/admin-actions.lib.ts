import { session } from '@/entities/session/session.state';
import { UserModel } from '@/entities/user/user.model';
import { User, UserRole, UserStatus } from '@/shared/sdk/types';

export type UserAdminActionsAvailability = {
  changeRoles: boolean;
  changeNickname: boolean;
  manageAchievements: boolean;
  issueWarning: boolean;
  punishmentHistory: boolean;
  ban: boolean;
  unban: boolean;
};

const canChangeTargetRoles = (target: User): boolean => {
  if (!session.canManageRoles) return false;

  const actorRoles = session.user?.data?.roles ?? [];
  const targetRoles = target.roles ?? [];

  if (UserModel.hasAnyRole(actorRoles, [UserRole.OWNER])) {
    return true;
  }

  if (UserModel.hasAnyRole(targetRoles, [UserRole.OWNER, UserRole.SERVER_ADMIN])) {
    return false;
  }

  return UserModel.hasAnyRole(actorRoles, [UserRole.SERVER_ADMIN, UserRole.UVK]);
};

export const getUserAdminActionsAvailability = (target: User | null | undefined): UserAdminActionsAvailability => {
  const empty: UserAdminActionsAvailability = {
    changeRoles: false,
    changeNickname: false,
    manageAchievements: false,
    issueWarning: false,
    punishmentHistory: false,
    ban: false,
    unban: false,
  };

  if (!target) return empty;

  const actorId = session.user?.data?.id;
  const isSelf = Boolean(actorId && actorId === target.id);

  // Owner / server admin may manage their own achievements from the users list.
  if (isSelf) {
    return {
      ...empty,
      manageAchievements: session.canManageAchievements,
    };
  }

  const canModerate = session.canModerateUsers;

  return {
    changeRoles: canChangeTargetRoles(target),
    changeNickname: canModerate,
    manageAchievements: session.canManageAchievements,
    issueWarning: canModerate,
    punishmentHistory: canModerate,
    ban: canModerate && target.status !== UserStatus.BANNED,
    unban: canModerate && target.status === UserStatus.BANNED,
  };
};

export const hasAnyUserAdminAction = (availability: UserAdminActionsAvailability) =>
  Object.values(availability).some(Boolean);
