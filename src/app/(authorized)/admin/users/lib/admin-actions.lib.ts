import { session } from '@/entities/session/session.state';
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
  const actorIsOwner = session.user?.data?.roles?.includes(UserRole.OWNER) ?? false;
  const targetIsOwner = target.roles?.includes(UserRole.OWNER) ?? false;

  return {
    changeRoles: session.canManageRoles && !(actorIsOwner && targetIsOwner),
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
