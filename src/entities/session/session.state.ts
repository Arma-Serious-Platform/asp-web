import { makeAutoObservable } from 'mobx';

import { UserModel } from '@/entities/user/user.model';
import { ROUTES } from '@/shared/config/routes';
import { SideType, SquadRole, User, UserRole, UserStatus } from '@/shared/sdk/types';
import { Preloader } from '@/shared/state/loader';
import { authApi, usersApi } from '@/shared/sdk';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { runInAction } from 'mobx';

export class SessionState {
  constructor() {
    makeAutoObservable(this);
  }

  user: UserModel | null = null;

  preloader = new Preloader();

  isAuthorized = false;

  isSessionReady = false;

  private get roles() {
    return this.user?.data?.roles;
  }

  get canManageRoles() {
    return UserModel.hasAnyRole(this.roles, [UserRole.OWNER]);
  }

  get canManageUsers() {
    return this.canManageRoles || this.canModerateUsers;
  }

  get canManageWeekends() {
    return UserModel.hasAnyRole(this.roles, [UserRole.OWNER, UserRole.SERVER_ADMIN, UserRole.UVK]);
  }

  get canManageIslands() {
    return UserModel.hasAnyRole(this.roles, [UserRole.OWNER, UserRole.SERVER_ADMIN, UserRole.TECH_ADMIN]);
  }

  get canManageServers() {
    return UserModel.hasAnyRole(this.roles, [UserRole.OWNER, UserRole.SERVER_ADMIN]);
  }

  get canManageRules() {
    return UserModel.hasAnyRole(this.roles, [UserRole.OWNER, UserRole.SERVER_ADMIN]);
  }

  get canManageSpecializations() {
    return UserModel.hasAnyRole(this.roles, [UserRole.OWNER, UserRole.SERVER_ADMIN]);
  }

  get canManageSquadsAndSides() {
    return UserModel.hasAnyRole(this.roles, [UserRole.OWNER, UserRole.SERVER_ADMIN, UserRole.TECH_ADMIN]);
  }

  get canManageMissions() {
    return UserModel.hasAnyRole(this.roles, [UserRole.OWNER, UserRole.SERVER_ADMIN, UserRole.UVK]);
  }

  get canReviewMissions() {
    return UserModel.hasAnyRole(this.roles, [UserRole.MISSION_REVIEWER]) || this.canManageMissions;
  }

  get isHasAdminPanelAccess() {
    return (
      this.canManageUsers ||
      this.canManageWeekends ||
      this.canManageIslands ||
      this.canManageServers ||
      this.canManageSquadsAndSides ||
      this.canManageRules ||
      this.canManageSpecializations
    );
  }

  get canModerateUsers() {
    return UserModel.hasAnyRole(this.roles, [UserRole.OWNER, UserRole.SERVER_ADMIN, UserRole.GAME_ADMIN]);
  }

  get canPermanentlyBanUsers() {
    return UserModel.hasAnyRole(this.roles, [UserRole.OWNER, UserRole.SERVER_ADMIN]);
  }

  get isCommunicationMuted() {
    const user = this.user?.data;
    if (!user?.isMuted || user.status !== UserStatus.BANNED || !user.bannedUntil) {
      return false;
    }

    return new Date(user.bannedUntil).getTime() > Date.now();
  }

  get canSeeSensitiveUsersData() {
    return UserModel.hasAnyRole(this.roles, [UserRole.OWNER, UserRole.SERVER_ADMIN]);
  }

  get hasTechAdminAccess() {
    return this.canManageSquadsAndSides || this.canManageIslands;
  }

  get canAccessHeadquarters() {
    const user = this.user?.data;
    const squad = user?.squad;
    const squadRole = user?.squadRole;

    return Boolean(
      squad &&
      squad.side?.type !== SideType.UNASSIGNED &&
      (squad.leader?.id === user?.id || squadRole === SquadRole.SUBLEADER || squadRole === SquadRole.HQ),
    );
  }

  hydrate = (user: User | null) => {
    runInAction(() => {
      this.user = user ? new UserModel(user) : null;
      this.isAuthorized = Boolean(user);
      this.isSessionReady = true;
      this.preloader.stop();
    });
  };

  boot = async () => {
    if (this.isSessionReady) {
      return;
    }

    this.preloader.start();

    try {
      await this.fetchMe();
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
          toast.error("Не вдалося з'єднатися з сервером. Повторна спроба через 5 секунд...");

          setTimeout(async () => {
            await this.boot();
          }, 5000);

          return;
        }

        if (error.response?.status === 401) {
          this.hydrate(null);
          return;
        }
      }

      this.hydrate(null);
    } finally {
      this.isSessionReady = true;
      this.preloader.stop();
    }
  };

  fetchMe = async () => {
    const { data } = await usersApi.getMe();

    this.hydrate(data);
  };

  authorize = (user: User) => {
    this.hydrate(user);
  };

  logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Session may already be cleared on the server.
    }

    this.hydrate(null);

    if (typeof window !== 'undefined') {
      window.location.assign(ROUTES.home);
    }
  };
}

export const session = new SessionState();
