'use client';

import axios from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import {
  BanUserDto,
  ChangePasswordDto,
  ConfirmForgotPasswordDto,
  CreateChatDto,
  CreateGameDto,
  CreateMissionCommentDto,
  CreateMissionDto,
  CreateMissionVersionDto,
  CreateServerDto,
  CreateSideDto,
  CreateSquadDto,
  CreateWeekendDto,
  FindMissionCommentsDto,
  FindMissionsDto,
  FindServersDto,
  FindSidesDto,
  FindSquadsDto,
  FindUsersDto,
  FindWeekendsDto,
  ForgotPasswordDto,
  Game,
  InviteToSquadDto,
  Island,
  LoginDto,
  LoginResponse,
  Mission,
  Chat,
  MissionComment,
  MissionStatus,
  MissionVersion,
  PaginatedResponse,
  RefreshTokenDto,
  Server,
  Side,
  SignUpDto,
  Squad,
  SquadInvitation,
  UpdateGameDto,
  UpdateMissionCommentDto,
  UpdateMissionDto,
  UpdateMissionVersionDto,
  UpdateServerDto,
  UpdateSideDto,
  UpdateSquadDto,
  UpdateUserDto,
  ChangeUserRoleDto,
  UpdateWeekendDto,
  UserRole,
  User,
  Weekend,
} from './types';

import { env } from '../config/env';

import {
  clearTokensFromLocalStorage,
  getTokensFromLocalStorage,
  redirectToLogin,
  setTokensToLocalStorage,
} from '../utils/session';

class ApiModel {
  instance = axios.create({
    baseURL: env.apiUrl,
    headers: {
      'Content-Type': 'application/json',
      ...(getTokensFromLocalStorage?.()?.token && { Authorization: `Bearer ${getTokensFromLocalStorage?.()?.token}` }),
    },
  });

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(request => {
      const token = getTokensFromLocalStorage().token;

      if (token) {
        request.headers['Authorization'] = `Bearer ${token}`;
      }

      return request;
    });

    createAuthRefreshInterceptor(
      this.instance,
      async failedRequest => {
        const storedRefreshToken = getTokensFromLocalStorage().refreshToken || '';

        // Do not try to refresh on refresh/logout endpoints or when there is no refresh token
        if ((failedRequest?.config?.url && failedRequest.config.url.includes('refresh-token')) || !storedRefreshToken) {
          clearTokensFromLocalStorage();
          redirectToLogin();

          return Promise.reject(failedRequest);
        }

        try {
          const { data } = await this.refreshToken({ refreshToken: storedRefreshToken });

          setTokensToLocalStorage(data.token, data.refreshToken);

          // Update default headers for all next requests
          this.instance.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

          // Update the failed request with the new token so it will be retried correctly
          if (failedRequest.response?.config?.headers) {
            failedRequest.response.config.headers['Authorization'] = `Bearer ${data.token}`;
          } else if (failedRequest.config?.headers) {
            failedRequest.config.headers['Authorization'] = `Bearer ${data.token}`;
          }

          return Promise.resolve();
        } catch {
          clearTokensFromLocalStorage();
          redirectToLogin();

          return Promise.reject(failedRequest);
        }
      },
      {
        pauseInstanceWhileRefreshing: true,
        statusCodes: [401],
      },
    );
  }

  /* Servers */

  findServers = async (dto: FindServersDto) => {
    return await this.instance.get<Server[]>('/servers', {
      params: dto,
    });
  };

  findServerById = async (id: string) => {
    return await this.instance.get<Server>(`/servers/${id}`);
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
    const bannedUntil = typeof dto.bannedUntil === 'string' ? dto.bannedUntil : dto.bannedUntil.toISOString();
    return await this.instance.post(`/users/ban/${dto.userId}/${bannedUntil}`);
  };

  unbanUser = async (userId: string) => {
    return await this.instance.post(`/users/unban/${userId}`);
  };

  deleteUser = async (id: string) => {
    return await this.instance.delete(`/users/${id}`);
  };

  changeIsMissionReviewer = async (userId: string, isMissionReviewer: boolean) => {
    return await this.instance.post(`/users/change-is-mission-reviewer`, {
      userId,
      isMissionReviewer,
    });
  };

  changeUserRole = async (dto: ChangeUserRoleDto) => {
    return await this.instance.post<User>('/users/change-role', dto);
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
        formData.append(key, typeof value === 'number' ? value.toString() : value);
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
    return await this.instance.post<SquadInvitation>(`/squads/invite/${dto.userId}`);
  };

  squadInvitations = async () => {
    return await this.instance.get<SquadInvitation[]>('/squads/invitations');
  };

  acceptSquadInvitation = async (invitationId: string) => {
    return await this.instance.post<SquadInvitation>(`/squads/invitations/accept/${invitationId}`);
  };

  rejectSquadInvitation = async (invitationId: string) => {
    return await this.instance.post<SquadInvitation>(`/squads/invitations/reject/${invitationId}`);
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

  findSideById = async (id: string) => {
    return await this.instance.get<Side>(`/sides/${id}`);
  };

  createSide = async (dto: CreateSideDto) => {
    return await this.instance.post<Side>('/sides', dto);
  };

  updateSide = async (id: string, dto: UpdateSideDto) => {
    return await this.instance.patch<Side>(`/sides/${id}`, dto);
  };

  deleteSide = async (id: string) => {
    return await this.instance.delete<Side>(`/sides/${id}`);
  };

  assignSquadToSide = async (sideId: string, squadId: string) => {
    return await this.instance.post<Side>(`/sides/${sideId}/assign-squad/${squadId}`);
  };

  assignLeaderToSide = async (sideId: string, leaderId: string) => {
    return await this.instance.post<Side>(`/sides/${sideId}/assign-leader/${leaderId}`);
  };

  unassignSquadFromSide = async (sideId: string, squadId: string) => {
    return await this.instance.post<Side>(`/sides/${sideId}/unassign-squad/${squadId}`);
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
    formData.append('islandId', dto.islandId);

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

    if (dto.islandId) {
      formData.append('islandId', dto.islandId);
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

  createMissionVersion = async (missionId: string, dto: CreateMissionVersionDto) => {
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

    if (dto.attackScreenshots?.length) {
      dto.attackScreenshots.forEach(file => {
        formData.append('attackScreenshots', file);
      });
    }

    if (dto.defenseScreenshots?.length) {
      dto.defenseScreenshots.forEach(file => {
        formData.append('defenseScreenshots', file);
      });
    }

    if (dto.rating !== undefined) {
      formData.append('rating', dto.rating.toString());
    }

    return await this.instance.post<MissionVersion>(`/missions/${missionId}/versions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  updateMissionVersion = async (missionId: string, versionId: string, dto: UpdateMissionVersionDto) => {
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

    if (dto.attackScreenshots?.length) {
      dto.attackScreenshots.forEach(file => {
        formData.append('attackScreenshots', file);
      });
    }

    if (dto.defenseScreenshots?.length) {
      dto.defenseScreenshots.forEach(file => {
        formData.append('defenseScreenshots', file);
      });
    }

    if (dto.removeAttackScreenshotIds?.length) {
      dto.removeAttackScreenshotIds.forEach((id, index) => {
        formData.append(`removeAttackScreenshotIds[${index}]`, id);
      });
    }

    if (dto.removeDefenseScreenshotIds?.length) {
      dto.removeDefenseScreenshotIds.forEach((id, index) => {
        formData.append(`removeDefenseScreenshotIds[${index}]`, id);
      });
    }

    if (dto.rating !== undefined) {
      formData.append('rating', dto.rating.toString());
    }

    return await this.instance.patch<MissionVersion>(`/missions/${missionId}/versions/${versionId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  changeMissionVersionStatus = async (missionId: string, versionId: string, status: MissionStatus) => {
    return await this.instance.post(`/missions/${missionId}/versions/${versionId}/change-status`, {
      status,
    });
  };

  /* Mission comments */

  findMissionComments = async (dto: FindMissionCommentsDto = {}) => {
    return await this.instance.get<PaginatedResponse<MissionComment>>('/mission-comments', {
      params: dto,
    });
  };

  createMissionComment = async (dto: CreateMissionCommentDto) => {
    return await this.instance.post<MissionComment>('/mission-comments', dto);
  };

  findMissionCommentById = async (id: string) => {
    return await this.instance.get<MissionComment>(`/mission-comments/${id}`);
  };

  updateMissionComment = async (id: string, dto: UpdateMissionCommentDto) => {
    return await this.instance.patch<MissionComment>(`/mission-comments/${id}`, dto);
  };

  deleteMissionComment = async (id: string) => {
    return await this.instance.delete(`/mission-comments/${id}`);
  };

  /* Weekends */

  findWeekends = async (dto: FindWeekendsDto = {}) => {
    return await this.instance.get<PaginatedResponse<Weekend>>('/weekends', {
      params: dto,
    });
  };

  createWeekend = async (dto: CreateWeekendDto) => {
    return await this.instance.post<Weekend>('/weekends', dto);
  };

  updateWeekend = async (id: string, dto: UpdateWeekendDto) => {
    return await this.instance.patch<Weekend>(`/weekends/${id}`, dto);
  };

  deleteWeekend = async (weekendId: string) => {
    return await this.instance.delete<Weekend>(`/weekends/${weekendId}`);
  };

  findWeekendById = async (weekendId: string) => {
    return await this.instance.get<Weekend>(`/weekends/${weekendId}`);
  };

  /* Games (nested under weekends) */

  createGame = async (weekendId: string, dto: CreateGameDto) => {
    return await this.instance.post<Game>(`/weekends/${weekendId}/games`, dto);
  };

  updateGame = async (weekendId: string, gameId: string, dto: UpdateGameDto) => {
    return await this.instance.patch<Game>(`/weekends/${weekendId}/games/${gameId}`, dto);
  };

  deleteGame = async (weekendId: string, gameId: string) => {
    return await this.instance.delete<Game>(`/weekends/${weekendId}/games/${gameId}`);
  };

  /* Chats */

  findChats = async () => {
    return await this.instance.get<Chat[]>('/chats');
  };

  createChat = async (dto: CreateChatDto) => {
    return await this.instance.post<Chat>('/chats', dto);
  };

  findChatById = async (id: string) => {
    return await this.instance.get<Chat>(`/chats/${id}`);
  };

  updateChat = async (chatId: string, dto: { name: string }) => {
    return await this.instance.patch<Chat>(`/chats/${chatId}`, dto);
  };

  findChatMessages = async (chatId: string) => {
    return await this.instance.get<unknown[]>(`/chats/${chatId}/messages`);
  };

  sendChatMessage = async (chatId: string, body?: unknown) => {
    return await this.instance.post(`/chats/${chatId}/messages`, body ?? {});
  };

  leaveChat = async (chatId: string) => {
    return await this.instance.delete(`/chats/${chatId}/leave`);
  };
}

export const api = new ApiModel();
