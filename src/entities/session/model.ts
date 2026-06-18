import { makeAutoObservable } from 'mobx';

import { UserModel } from '@/entities/user/model';
import { SideType, SquadRole, User, UserRole } from '@/shared/sdk/types';
import { Preloader } from '@/shared/model/loader';
import { api } from '@/shared/sdk';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

export class SessionModel {
  constructor() {
    makeAutoObservable(this);
  }

  user = new UserModel();

  preloader = new Preloader(true);

  isAuthorized = false;

  get canManageRoles() {
    return this.user?.user?.role === UserRole.OWNER;
  }

  get canManageUsers() {
    return this.canManageRoles || this.canModerateUsers;
  }

  get canManageWeekends() {
    return [UserRole.OWNER, UserRole.SERVER_ADMIN, UserRole.UVK].includes(this.user?.user?.role as UserRole);
  }

  get canManageIslands() {
    return [UserRole.OWNER, UserRole.SERVER_ADMIN, UserRole.TECH_ADMIN].includes(this.user?.user?.role as UserRole);
  }

  get canManageServers() {
    return [UserRole.OWNER, UserRole.SERVER_ADMIN].includes(this.user?.user?.role as UserRole);
  }

  get canManageRules() {
    return [UserRole.OWNER, UserRole.SERVER_ADMIN].includes(this.user?.user?.role as UserRole);
  }

  get canManageSpecializations() {
    return [UserRole.OWNER, UserRole.SERVER_ADMIN].includes(this.user?.user?.role as UserRole);
  }

  get canManageSquadsAndSides() {
    return [UserRole.OWNER, UserRole.SERVER_ADMIN, UserRole.TECH_ADMIN].includes(this.user?.user?.role as UserRole);
  }

  get canManageMissions() {
    return [UserRole.OWNER, UserRole.SERVER_ADMIN, UserRole.UVK].includes(this.user?.user?.role as UserRole);
  }

  get canReviewMissions() {
    return Boolean(this.user?.user?.isMissionReviewer) || this.canManageMissions;
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
    return [UserRole.OWNER, UserRole.SERVER_ADMIN, UserRole.GAME_ADMIN].includes(this.user?.user?.role as UserRole);
  }

  get canPermanentlyBanUsers() {
    return [UserRole.OWNER, UserRole.SERVER_ADMIN].includes(this.user?.user?.role as UserRole);
  }

  get canSeeSensitiveUsersData() {
    return [UserRole.OWNER, UserRole.SERVER_ADMIN].includes(this.user?.user?.role as UserRole);
  }

  get hasTechAdminAccess() {
    return this.canManageSquadsAndSides || this.canManageIslands;
  }

  get canAccessHeadquarters() {
    const user = this.user?.user;
    const squad = user?.squad;
    const squadRole = user?.squadRole;

    return Boolean(
      squad &&
      squad.side?.type !== SideType.UNASSIGNED &&
      (squad.leader?.id === user?.id || squadRole === SquadRole.SUBLEADER || squadRole === SquadRole.HQ),
    );
  }

  hydrate = (user: User | null) => {
    this.user.user = user;
    this.isAuthorized = Boolean(user);
  };

  boot = async () => {
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
      this.preloader.stop();
    }
  };

  fetchMe = async () => {
    const { data } = await api.getMe();

    this.hydrate(data);
  };

  authorize = (user: User) => {
    this.hydrate(user);
  };

  logout = async () => {
    try {
      await api.logout();
    } catch {
      // Session may already be cleared on the server.
    }

    this.hydrate(null);
  };
}

export const session = new SessionModel();
