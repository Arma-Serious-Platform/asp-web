import axios from 'axios';
import {
  BanUserDto,
  ChangePasswordDto,
  ConfirmForgotPasswordDto,
  CreateMissionDto,
  CreateMissionVersionDto,
  CreateServerDto,
  CreateSquadDto,
  FindMissionsDto,
  FindServersDto,
  FindSidesDto,
  FindSquadsDto,
  FindUsersDto,
  ForgotPasswordDto,
  InviteToSquadDto,
  Island,
  LoginDto,
  LoginResponse,
  Mission,
  MissionStatus,
  MissionVersion,
  PaginatedResponse,
  RefreshTokenDto,
  Server,
  Side,
  SignUpDto,
  Squad,
  SquadInvitation,
  UpdateMissionDto,
  UpdateMissionVersionDto,
  UpdateServerDto,
  UpdateSquadDto,
  UpdateUserDto,
  User,
} from './types';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';

import { env } from '../config/env';
import { setTokens } from '../actions/cookies/set-tokens';

class ApiModel {
  /* Servers */

  private isRefreshing = false;
  private refreshFailed = false;

  instance = axios.create({
    baseURL: env.apiUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.instance.interceptors.request.use(async (config) => {
      const token = await getCookie('token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    this.instance.interceptors.response.use(
      (res) => res,
      async (error) => {
        const { config, response } = error;
        if (
          (response?.status === 401 || response?.status === 403) &&
          !config._retry &&
          !this.refreshFailed
        ) {
          config._retry = true;

          // Prevent concurrent refresh attempts
          if (this.isRefreshing) {
            return Promise.reject(error);
          }

          const refreshToken =
            typeof window === 'undefined'
              ? await (await import('next/headers'))
                  .cookies()
                  .then((cookie) => cookie.get('refreshToken')?.value)
              : await getCookie('refreshToken');

          if (!refreshToken) {
            this.refreshFailed = true;
            throw error;
          }

          this.isRefreshing = true;

          try {
            const { data } = await this.refreshToken({ refreshToken });

            if (data?.token && data?.refreshToken) {
              config.headers.Authorization = `Bearer ${data.token}`;

              if (typeof window === 'undefined') {
                try {
                  setTokens({
                    token: data.token,
                    refreshToken: data.refreshToken,
                  });
                } catch (error) {
                  console.error(error);
                }
              } else {
                await setCookie('token', data.token);
                await setCookie('refreshToken', data.refreshToken);
              }

              this.isRefreshing = false;
              this.refreshFailed = false;
              return this.instance(config);
            }
          } catch {
            this.refreshFailed = true;
            this.isRefreshing = false;

            // Clear invalid tokens
            if (typeof window !== 'undefined') {
              await deleteCookie('token');
              await deleteCookie('refreshToken');
            }

            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /* Servers */

  findServers = async (dto: FindServersDto) => {
    return await this.instance.get<Server[]>('/servers', {
      params: dto,
    });
  };

  updateServer = async ({ id, ...dto }: UpdateServerDto) => {
    return await this.instance.patch<Server>(`/servers/${id}`, dto);
  };

  createServer = async (dto: CreateServerDto) => {
    return await this.instance.post<Server>('/servers', dto);
  };

  deleteServer = async (serverId: string) => {
    return await this.instance.delete<Server>(`/servers/${serverId}`);
  };

  /* Auth */

  singUp = async (dto: SignUpDto) => {
    return await this.instance.post('/users/signup', dto);
  };

  confirmSignUp = async (token: string) => {
    return await this.instance.post('/users/sign-up/confirm', { token });
  };

  login = async ({ email, password }: LoginDto) => {
    return await this.instance.post<LoginResponse>('/users/login', {
      emailOrNickname: email,
      password,
    });
  };

  refreshToken = async (dto: RefreshTokenDto) => {
    return await this.instance.post<LoginResponse>('/users/refresh-token', dto);
  };

  changePassword = async (dto: ChangePasswordDto) => {
    return await this.instance.post('/users/change-password', dto);
  };

  forgotPassword = async (dto: ForgotPasswordDto) => {
    return await this.instance.post('/users/forgot-password', dto);
  };

  confirmForgotPassword = async (dto: ConfirmForgotPasswordDto) => {
    return await this.instance.post('/users/reset-password', dto);
  };

  /* Users */

  getMe = async () => {
    return await this.instance.get<User>('/users/me');
  };

  getUserByIdOrNickname = async (userIdOrNickname: string) => {
    return await this.instance.get<User>(`/users/${userIdOrNickname}`);
  };

  updateMe = async (dto: UpdateUserDto) => {
    return await this.instance.patch<User>('/users/me', dto);
  };

  findUsers = async (dto: FindUsersDto) => {
    return await this.instance.get<PaginatedResponse<User>>('/users', {
      params: dto,
    });
  };

  changeAvatar = async (avatar: File) => {
    const formData = new FormData();
    formData.append('avatar', avatar);

    return await this.instance({
      method: 'POST',
      url: '/users/change-avatar',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  banUser = async (dto: BanUserDto) => {
    return await this.instance.post(`/users/ban/${dto.userId}`, dto);
  };

  unbanUser = async (userId: string) => {
    return await this.instance.post(`/users/unban/${userId}`);
  };

  changeIsMissionReviewer = async (
    userId: string,
    isMissionReviewer: boolean
  ) => {
    return await this.instance.post(`/users/change-is-mission-reviewer`, {
      userId,
      isMissionReviewer,
    });
  };

  /* Squads */

  createSquad = async (dto: CreateSquadDto) => {
    const formData = new FormData();
    if (dto.logo) {
      formData.append('logo', dto.logo);
    }
    formData.append('name', dto.name);
    formData.append('tag', dto.tag);
    formData.append('description', dto.description);
    formData.append('leaderId', dto.leaderId);
    formData.append('sideId', dto.sideId);
    return await this.instance.post<Squad>('/squads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  updateSquad = async ({ id, ...dto }: UpdateSquadDto) => {
    const formData = new FormData();

    Object.entries(dto).forEach(([key, value]) => {
      if (value) {
        formData.append(
          key,
          typeof value === 'number' ? value.toString() : value
        );
      }
    });

    return await this.instance.patch<Squad>(`/squads/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  deleteSquad = async (squadId: string) => {
    return await this.instance.delete<Squad>(`/squads/${squadId}`);
  };

  findSquads = async (dto: FindSquadsDto) => {
    return await this.instance.get<PaginatedResponse<Squad>>('/squads', {
      params: dto,
    });
  };

  inviteToSquad = async (dto: InviteToSquadDto) => {
    return await this.instance.post<SquadInvitation>(
      `/squads/invite/${dto.userId}`
    );
  };

  squadInvitations = async () => {
    return await this.instance.get<SquadInvitation[]>('/squads/invitations');
  };

  acceptSquadInvitation = async (invitationId: string) => {
    return await this.instance.post<SquadInvitation>(
      `/squads/invitations/accept/${invitationId}`
    );
  };

  rejectSquadInvitation = async (invitationId: string) => {
    return await this.instance.post<SquadInvitation>(
      `/squads/invitations/reject/${invitationId}`
    );
  };

  kickFromSquad = async (userId: string) => {
    return await this.instance.post<void>(`/squads/kick/${userId}`);
  };

  leaveFromSquad = async (newLeaderId?: string) => {
    return await this.instance.post<void>(`/squads/leave`, { newLeaderId });
  };

  /* Sides */

  findSides = async (dto: FindSidesDto) => {
    return await this.instance.get<PaginatedResponse<Side>>('/sides', {
      params: dto,
    });
  };

  /* Missions */

  findIslands = async () => {
    return await this.instance.get<Island[]>('/missions/islands');
  };

  findMissions = async (dto: FindMissionsDto) => {
    return await this.instance.get<PaginatedResponse<Mission>>('/missions', {
      params: dto,
    });
  };

  findMissionById = async (missionId: string) => {
    return await this.instance.get<Mission>(`/missions/${missionId}`);
  };

  createMission = async (dto: CreateMissionDto) => {
    const formData = new FormData();
    if (dto.image) {
      formData.append('image', dto.image);
    }

    formData.append('name', dto.name);
    formData.append('description', dto.description);

    return await this.instance.post<Mission>('/missions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  updateMission = async ({ id, ...dto }: UpdateMissionDto) => {
    const formData = new FormData();
    if (dto.image) {
      formData.append('image', dto.image);
    }

    if (dto.name) {
      formData.append('name', dto.name);
    }
    if (dto.description) {
      formData.append('description', dto.description);
    }

    return await this.instance.patch<Mission>(`/missions/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  createMissionVersion = async (
    missionId: string,
    dto: CreateMissionVersionDto
  ) => {
    const formData = new FormData();
    if (dto.file) {
      formData.append('file', dto.file);
    }

    formData.append('version', dto.version);
    formData.append('missionId', missionId);
    formData.append('attackSideType', dto.attackSideType);
    formData.append('defenseSideType', dto.defenseSideType);
    formData.append('attackSideSlots', dto.attackSideSlots.toString());
    formData.append('defenseSideSlots', dto.defenseSideSlots.toString());
    formData.append('attackSideName', dto.attackSideName);
    formData.append('defenseSideName', dto.defenseSideName);

    if (dto.weaponry && dto.weaponry.length > 0) {
      dto.weaponry.forEach((weaponry, index) => {
        formData.append(`weaponry[${index}][name]`, weaponry.name);
        formData.append(`weaponry[${index}][count]`, weaponry.count.toString());
        formData.append(`weaponry[${index}][type]`, weaponry.type);
        if (weaponry.description) {
          formData.append(`weaponry[${index}][description]`, weaponry.description);
        }
      });
    }

    if (dto.rating !== undefined) {
      formData.append('rating', dto.rating.toString());
    }

    return await this.instance.post<MissionVersion>(
      `/missions/${missionId}/versions`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  };

  updateMissionVersion = async (
    missionId: string,
    versionId: string,
    dto: UpdateMissionVersionDto
  ) => {
    const formData = new FormData();
    if (dto.file) {
      formData.append('file', dto.file);
    }

    if (dto.version) {
      formData.append('version', dto.version);
    }
    if (dto.attackSideType) {
      formData.append('attackSideType', dto.attackSideType);
    }
    if (dto.defenseSideType) {
      formData.append('defenseSideType', dto.defenseSideType);
    }
    if (dto.attackSideSlots !== undefined) {
      formData.append('attackSideSlots', dto.attackSideSlots.toString());
    }
    if (dto.defenseSideSlots !== undefined) {
      formData.append('defenseSideSlots', dto.defenseSideSlots.toString());
    }
    if (dto.attackSideName) {
      formData.append('attackSideName', dto.attackSideName);
    }
    if (dto.defenseSideName) {
      formData.append('defenseSideName', dto.defenseSideName);
    }

    if (dto.weaponry !== undefined) {
      if (dto.weaponry.length > 0) {
        dto.weaponry.forEach((weaponry, index) => {
          formData.append(`weaponry[${index}][name]`, weaponry.name);
          formData.append(`weaponry[${index}][count]`, weaponry.count.toString());
          formData.append(`weaponry[${index}][type]`, weaponry.type);
          if (weaponry.description) {
            formData.append(`weaponry[${index}][description]`, weaponry.description);
          }
        });
      } else {
        // Empty array means clear all weaponry
        formData.append('weaponry', '[]');
      }
    }

    if (dto.rating !== undefined) {
      formData.append('rating', dto.rating.toString());
    }

    return await this.instance.patch<MissionVersion>(
      `/missions/${missionId}/versions/${versionId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  };

  changeMissionVersionStatus = async (
    missionId: string,
    versionId: string,
    status: MissionStatus
  ) => {
    return await this.instance.post(
      `/missions/${missionId}/versions/${versionId}/change-status`,
      {
        status,
      }
    );
  };
}

export const api = new ApiModel();
