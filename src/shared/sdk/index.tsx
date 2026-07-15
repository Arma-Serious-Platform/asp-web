'use client';

import axios from 'axios';
import {
  BanUserDto,
  ChangeNicknameDto,
  ChangePasswordDto,
  DisableTwoFactorDto,
  EnableTwoFactorDto,
  EnableTwoFactorResponse,
  TwoFactorSetupResponse,
  TwoFactorStatusResponse,
  VerifyTwoFactorLoginDto,
  AddChatMembersDto,
  CreateChatDto,
  CreateGameDto,
  CreateIslandDto,
  CreateMissionCommentDto,
  CreateMissionDto,
  CreateMissionVersionDto,
  CreateServerDto,
  CreateSideDto,
  CreateSpecializationDto,
  CreateSquadDto,
  CreateWeekendDto,
  FindMissionCommentsDto,
  FindMissionsDto,
  FindIslandsDto,
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
  SessionLoginDto,
  UserSession,
  Mission,
  Chat,
  MissionComment,
  MissionStatus,
  MissionVersion,
  PaginatedResponse,
  RulesContent,
  Server,
  SetUserSpecializationsDto,
  Side,
  SignUpDto,
  Specialization,
  Squad,
  SquadInvitation,
  SquadJoinRequest,
  UpdateGameDto,
  UpdateIslandDto,
  UpdateMissionCommentDto,
  UpdateMySquadDto,
  UpdateMissionDto,
  UpdateMissionVersionDto,
  UpdateRulesDto,
  UpdateServerDto,
  UpdateSideDto,
  UpdateSpecializationDto,
  UpdateSquadDto,
  UpdateSquadMemberRoleDto,
  UpdateUserDto,
  ChangeUserNicknameDto,
  ChangeUserRoleDto,
  ChangeMissionStateDto,
  CreateUserWarningDto,
  UpdateWeekendDto,
  UserRole,
  User,
  UserPunishment,
  UserWarning,
  Weekend,
  HeadquartersGamePlan,
  UpdateHeadquartersGamePlanDto,
  UpdateHeadquartersGamePlanSlotDto,
  AssignHeadquartersSlotSquadDto,
  HeadquartersSlot,
  HeadquartersComment,
  FindHeadquartersCommentsDto,
  CreateHeadquartersCommentDto,
  UpdateHeadquartersCommentDto,
  UpdateChatMessageDto,
} from './types';

import { env } from '../config/env';
import { ROUTES } from '../config/routes';
import { buildTwoFactorCodePayload } from '../lib/two-factor-payload';
import { AUTH_REDIRECT_SKIP_PATHS } from '../lib/routes/lib';

const AUTH_PAGES = [ROUTES.auth.login, ROUTES.auth.signup, ROUTES.auth.forgotPassword] as const;

const appendStringArrayToFormData = (formData: FormData, key: string, values?: string[]) => {
  if (!values) return;

  if (values.length === 0) {
    formData.append(key, '[]');
    return;
  }

  values.forEach((value, index) => {
    formData.append(`${key}[${index}]`, value);
  });
};

const appendFormDataValue = (formData: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null) return;

  if (value instanceof File) {
    formData.append(key, value);
    return;
  }

  formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value.toString());
};

const extractUploadFiles = (files?: File[]) =>
  files?.filter((file): file is File => file instanceof File) ?? [];

const appendAttachmentUpdateFormData = (
  formData: FormData,
  fields: {
    message?: unknown;
    content?: unknown;
    removedAttachmentIds?: string[];
  },
  files: File[],
) => {
  if (fields.message !== undefined) {
    formData.append('message', JSON.stringify(fields.message));
  }
  if (fields.content !== undefined) {
    formData.append('content', JSON.stringify(fields.content));
  }
  if (fields.removedAttachmentIds?.length) {
    formData.append('removedAttachmentIds', JSON.stringify(fields.removedAttachmentIds));
  }
  files.forEach(file => {
    formData.append('attachments', file);
  });
};

class ApiModel {
  instance = axios.create({
    baseURL: env.apiUrl,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(request => {
      if (request.data instanceof FormData && request.headers) {
        if (typeof request.headers.delete === 'function') {
          request.headers.delete('Content-Type');
        } else {
          delete (request.headers as Record<string, unknown>)['Content-Type'];
        }
      }

      return request;
    });

    this.instance.interceptors.response.use(
      response => response,
      error => {
        const status = error.response?.status;
        const requestUrl = error.config?.url ?? '';

        if (
          status === 401 &&
          typeof window !== 'undefined' &&
          !this.shouldSkipAuthRedirect(requestUrl, window.location.pathname)
        ) {
          window.location.assign(ROUTES.auth.login);
        }

        return Promise.reject(error);
      },
    );
  }

  private shouldSkipAuthRedirect(requestUrl: string, pathname: string) {
    if (AUTH_REDIRECT_SKIP_PATHS.some(path => requestUrl.includes(path))) {
      return true;
    }

    return AUTH_PAGES.some(path => pathname.startsWith(path));
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
    const payload: SessionLoginDto = {
      emailOrNickname: email,
      password,
    };

    const { data } = await this.instance.post<{
      requiresTwoFactor?: boolean;
      twoFactorToken?: string;
    }>('/auth/session/login', payload);

    if (data.requiresTwoFactor && data.twoFactorToken) {
      return {
        data: {
          requiresTwoFactor: true as const,
          twoFactorToken: data.twoFactorToken,
        },
      };
    }

    return this.getMe();
  };

  verifyTwoFactorLogin = async (dto: VerifyTwoFactorLoginDto) => {
    const { data } = await this.instance.post<{ user: User }>('/auth/session/verify-2fa', {
      twoFactorToken: dto.twoFactorToken,
      ...buildTwoFactorCodePayload(dto.code, dto.recoveryCode),
    });

    return { data: data.user };
  };

  getTwoFactorStatus = async () => {
    return await this.instance.get<TwoFactorStatusResponse>('/auth/2fa/status');
  };

  setupTwoFactor = async () => {
    return await this.instance.post<TwoFactorSetupResponse>('/auth/2fa/setup');
  };

  enableTwoFactor = async (dto: EnableTwoFactorDto) => {
    return await this.instance.post<EnableTwoFactorResponse>('/auth/2fa/enable', dto);
  };

  disableTwoFactor = async (dto: DisableTwoFactorDto) => {
    return await this.instance.post('/auth/2fa/disable', {
      password: dto.password.trim(),
      ...buildTwoFactorCodePayload(dto.code, dto.recoveryCode),
    });
  };

  logout = async () => {
    return await this.instance.post('/auth/session/logout');
  };

  findActiveSessions = async () => {
    return await this.instance.get<UserSession[]>('/auth/session');
  };

  revokeSession = async (sessionId: string) => {
    return await this.instance.delete(`/auth/session/${sessionId}`);
  };

  changePassword = async (dto: ChangePasswordDto) => {
    return await this.instance.post('/users/change-password', dto);
  };

  getRules = async () => {
    return await this.instance.get<RulesContent>('/rules');
  };

  updateRules = async (dto: UpdateRulesDto) => {
    return await this.instance.put<RulesContent>('/rules', dto);
  };

  forgotPassword = async (dto: ForgotPasswordDto) => {
    return await this.instance.post('/users/forgot-password', dto);
  };

  confirmForgotPassword = async (dto: ConfirmForgotPasswordDto) => {
    return await this.instance.post('/users/reset-password', dto);
  };

  /* Users */

  getMe = async () => {
    return await this.instance.get<User>('/auth/session/me');
  };

  getUserByIdOrNickname = async (userIdOrNickname: string) => {
    return await this.instance.get<User>(`/users/${userIdOrNickname}`);
  };

  updateMe = async (dto: UpdateUserDto) => {
    return await this.instance.patch<User>('/users/me', dto);
  };

  changeNickname = async (dto: ChangeNicknameDto) => {
    return await this.instance.patch<User>('/users/me/change-nickname', dto);
  };

  changeUserNickname = async ({ userId, ...dto }: ChangeUserNicknameDto) => {
    return await this.instance.patch<User>(`/users/${userId}/nickname`, dto);
  };

  disconnectSteam = async () => {
    return await this.instance.delete<User>('/users/me/steamId');
  };

  getSteamLoginUrl = () => {
    return `${env.apiUrl}/users/steam-login`;
  };

  steamCallback = async () => {
    return await this.instance.get('/users/steam/callback');
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
    return await this.instance.post<User>(`/users/ban/${dto.userId}/${bannedUntil}`, { reason: dto.reason });
  };

  permanentlyBanUser = async (userId: string, reason: string) => {
    return await this.instance.post<User>(`/users/ban/${userId}/permanent`, { reason });
  };

  unbanUser = async (userId: string, reason?: string) => {
    return await this.instance.post<User>(`/users/unban/${userId}`, { reason });
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

  createUserWarning = async ({ userId, ...dto }: CreateUserWarningDto) => {
    return await this.instance.post<UserWarning>(`/users/${userId}/warnings`, dto);
  };

  findUserWarnings = async (userId: string) => {
    return await this.instance.get<UserWarning[]>(`/users/${userId}/warnings`);
  };

  removeUserWarning = async (warningId: string, reason?: string) => {
    return await this.instance.delete<UserWarning>(`/users/warnings/${warningId}`, { data: { reason } });
  };

  findUserPunishmentHistory = async (userId: string) => {
    return await this.instance.get<UserPunishment[]>(`/users/${userId}/punishments`);
  };

  /* Squads */

  createSquad = async (dto: CreateSquadDto) => {
    const formData = new FormData();
    if (dto.logo) {
      formData.append('logo', dto.logo);
    }
    formData.append('name', dto.name);
    formData.append('tag', dto.tag);
    appendFormDataValue(formData, 'description', dto.description);
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

    Object.entries(dto).forEach(([key, value]) => appendFormDataValue(formData, key, value));

    return await this.instance.patch<Squad>(`/squads/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  updateMySquad = async (dto: UpdateMySquadDto) => {
    const formData = new FormData();

    Object.entries(dto).forEach(([key, value]) => appendFormDataValue(formData, key, value));

    return await this.instance.patch<Squad>('/squads/me', formData, {
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

  findSquadById = async (squadId: string) => {
    return await this.instance.get<Squad>(`/squads/${squadId}`);
  };

  inviteToSquad = async (dto: InviteToSquadDto) => {
    return await this.instance.post<SquadInvitation>(`/squads/invite/${dto.userId}`, {
      squadRole: dto.squadRole,
    });
  };

  updateSquadMemberRole = async ({ userId, role }: UpdateSquadMemberRoleDto) => {
    return await this.instance.patch<User>(`/squads/members/${userId}/role`, { role });
  };

  squadInvitations = async () => {
    return await this.instance.get<SquadInvitation[]>('/squads/invitations');
  };

  squadJoinRequests = async () => {
    return await this.instance.get<SquadJoinRequest[]>('/squads/join-requests');
  };

  mySquadJoinRequests = async () => {
    return await this.instance.get<SquadJoinRequest[]>('/squads/join-requests/my');
  };

  requestToJoinSquad = async (squadId: string) => {
    return await this.instance.post<SquadJoinRequest>(`/squads/join-requests/${squadId}`);
  };

  acceptSquadJoinRequest = async (requestId: string) => {
    return await this.instance.post<SquadJoinRequest>(`/squads/join-requests/accept/${requestId}`);
  };

  rejectSquadJoinRequest = async (requestId: string) => {
    return await this.instance.post<SquadJoinRequest>(`/squads/join-requests/reject/${requestId}`);
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

  transferSquadLeadership = async (userId: string) => {
    return await this.instance.post<void>(`/squads/leader/${userId}`);
  };

  leaveFromSquad = async (newLeaderId?: string) => {
    return await this.instance.post<void>(`/squads/leave`, { newLeaderId });
  };

  /* Specializations */

  findSpecializations = async () => {
    return await this.instance.get<Specialization[]>('/specializations');
  };

  findSpecializationById = async (id: string) => {
    return await this.instance.get<Specialization>(`/specializations/${id}`);
  };

  createSpecialization = async (dto: CreateSpecializationDto) => {
    const formData = new FormData();
    formData.append('name', dto.name);
    if (dto.color) {
      formData.append('color', dto.color);
    }
    if (dto.icon) {
      formData.append('icon', dto.icon);
    }

    return await this.instance.post<Specialization>('/specializations', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  updateSpecialization = async ({ id, ...dto }: UpdateSpecializationDto) => {
    const formData = new FormData();

    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value instanceof File ? value : value.toString());
      }
    });

    return await this.instance.patch<Specialization>(`/specializations/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  deleteSpecialization = async (id: string) => {
    return await this.instance.delete<Specialization>(`/specializations/${id}`);
  };

  setUserSpecializations = async ({ userId, specializationIds }: SetUserSpecializationsDto) => {
    return await this.instance.put<User>(`/specializations/users/${userId}`, { specializationIds });
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

  findIslandsPaginated = async (dto: FindIslandsDto) => {
    return await this.instance.get<PaginatedResponse<Island>>('/islands', {
      params: dto,
    });
  };

  findIslandById = async (id: string) => {
    return await this.instance.get<Island>(`/islands/${id}`);
  };

  createIsland = async (dto: CreateIslandDto) => {
    return await this.instance.post<Island>('/islands', dto);
  };

  updateIsland = async (id: string, dto: UpdateIslandDto) => {
    return await this.instance.patch<Island>(`/islands/${id}`, dto);
  };

  deleteIsland = async (id: string) => {
    return await this.instance.delete<void>(`/islands/${id}`);
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
    appendFormDataValue(formData, 'description', dto.description);
    formData.append('islandId', dto.islandId);
    formData.append('missionType', dto.missionType);
    appendStringArrayToFormData(formData, 'coauthorIds', dto.coauthorIds);

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
      appendFormDataValue(formData, 'description', dto.description);
    }

    if (dto.missionType) {
      formData.append('missionType', dto.missionType);
    }

    appendStringArrayToFormData(formData, 'coauthorIds', dto.coauthorIds);

    return await this.instance.patch<Mission>(`/missions/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  deleteMission = async (id: string) => {
    return await this.instance.delete<void>(`/missions/${id}`);
  };

  changeMissionState = async (id: string, dto: ChangeMissionStateDto) => {
    return await this.instance.patch<Mission>(`/missions/${id}/state`, dto);
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

    if (dto.minSlotsToPlay !== undefined && dto.minSlotsToPlay !== null) {
      formData.append('minSlotsToPlay', dto.minSlotsToPlay.toString());
    }

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

    appendFormDataValue(formData, 'inGameTime', dto.inGameTime);
    appendFormDataValue(formData, 'weather', dto.weather);
    appendFormDataValue(formData, 'changelog', dto.changelog);

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
    if (dto.minSlotsToPlay !== undefined) {
      formData.append('minSlotsToPlay', dto.minSlotsToPlay === null ? '' : dto.minSlotsToPlay.toString());
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

    appendFormDataValue(formData, 'inGameTime', dto.inGameTime);
    appendFormDataValue(formData, 'weather', dto.weather);
    appendFormDataValue(formData, 'changelog', dto.changelog);

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

  deleteMissionVersion = async (missionId: string, versionId: string) => {
    return await this.instance.delete<void>(`/missions/${missionId}/versions/${versionId}`);
  };

  /* Mission comments */

  findMissionComments = async (dto: FindMissionCommentsDto = {}) => {
    return await this.instance.get<PaginatedResponse<MissionComment>>('/mission-comments', {
      params: dto,
    });
  };

  createMissionComment = async (dto: CreateMissionCommentDto) => {
    const { attachments, ...body } = dto;
    const files = extractUploadFiles(attachments);

    if (files.length > 0) {
      const formData = new FormData();
      formData.append('missionId', body.missionId);
      formData.append('message', JSON.stringify(body.message));
      files.forEach(file => {
        formData.append('attachments', file);
      });

      return await this.instance.post<MissionComment>('/mission-comments', formData);
    }

    return await this.instance.post<MissionComment>('/mission-comments', body);
  };

  findMissionCommentById = async (id: string) => {
    return await this.instance.get<MissionComment>(`/mission-comments/${id}`);
  };

  updateMissionComment = async (id: string, dto: UpdateMissionCommentDto) => {
    const { attachments, removedAttachmentIds, ...body } = dto;
    const files = extractUploadFiles(attachments);

    if (files.length > 0) {
      const formData = new FormData();
      appendAttachmentUpdateFormData(formData, { message: body.message, removedAttachmentIds }, files);
      return await this.instance.patch<MissionComment>(`/mission-comments/${id}`, formData);
    }

    return await this.instance.patch<MissionComment>(`/mission-comments/${id}`, {
      ...body,
      ...(removedAttachmentIds?.length ? { removedAttachmentIds } : {}),
    });
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

  /* Headquarters */

  findHeadquartersPlansByGame = async (gameId: string) => {
    return await this.instance.get<HeadquartersGamePlan[]>(`/headquarters/games/${gameId}/plans`);
  };

  findHeadquartersPlanById = async (id: string) => {
    return await this.instance.get<HeadquartersGamePlan>(`/headquarters/plans/${id}`);
  };

  updateHeadquartersPlan = async (id: string, dto: UpdateHeadquartersGamePlanDto) => {
    return await this.instance.patch<HeadquartersGamePlan>(`/headquarters/plans/${id}`, dto);
  };

  assignHeadquartersCommander = async (id: string) => {
    return await this.instance.post<HeadquartersGamePlan>(`/headquarters/plans/${id}/assign-commander`);
  };

  unassignHeadquartersCommander = async (id: string) => {
    return await this.instance.post<HeadquartersGamePlan>(`/headquarters/plans/${id}/unassign-commander`);
  };

  assignHeadquartersHqSquad = async (id: string) => {
    return await this.instance.post<HeadquartersGamePlan>(`/headquarters/plans/${id}/assign-hq-squad`);
  };

  unassignHeadquartersHqSquad = async (id: string) => {
    return await this.instance.post<HeadquartersGamePlan>(`/headquarters/plans/${id}/unassign-hq-squad`);
  };

  updateHeadquartersSlot = async (slotId: string, dto: UpdateHeadquartersGamePlanSlotDto) => {
    return await this.instance.patch<HeadquartersSlot>(`/headquarters/slots/${slotId}`, dto);
  };

  assignHeadquartersSlotSquad = async (slotId: string, dto: AssignHeadquartersSlotSquadDto) => {
    return await this.instance.post<HeadquartersSlot>(`/headquarters/slots/${slotId}/assign-squad`, dto);
  };

  unassignHeadquartersSlotSquad = async (slotId: string, dto: AssignHeadquartersSlotSquadDto) => {
    return await this.instance.post<HeadquartersSlot>(`/headquarters/slots/${slotId}/unassign-squad`, dto);
  };

  assignHeadquartersSlotWantedSquad = async (slotId: string) => {
    return await this.instance.post<HeadquartersSlot>(`/headquarters/slots/${slotId}/wanted-squads/assign`);
  };

  unassignHeadquartersSlotWantedSquad = async (slotId: string) => {
    return await this.instance.post<HeadquartersSlot>(`/headquarters/slots/${slotId}/wanted-squads/unassign`);
  };

  findHeadquartersComments = async (gamePlanId: string, dto: FindHeadquartersCommentsDto = {}) => {
    return await this.instance.get<{ data: HeadquartersComment[]; total: number }>(
      `/headquarters/plans/${gamePlanId}/comments`,
      {
        params: dto,
      },
    );
  };

  createHeadquartersComment = async (gamePlanId: string, dto: CreateHeadquartersCommentDto) => {
    const { attachments, ...body } = dto;
    const files = extractUploadFiles(attachments);

    if (files.length > 0) {
      const formData = new FormData();
      formData.append('message', JSON.stringify(body.message));
      if (body.replyId) {
        formData.append('replyId', body.replyId);
      }
      files.forEach(file => {
        formData.append('attachments', file);
      });

      return await this.instance.post<HeadquartersComment>(`/headquarters/plans/${gamePlanId}/comments`, formData);
    }

    return await this.instance.post<HeadquartersComment>(`/headquarters/plans/${gamePlanId}/comments`, body);
  };

  updateHeadquartersComment = async (id: string, dto: UpdateHeadquartersCommentDto) => {
    const { attachments, removedAttachmentIds, ...body } = dto;
    const files = extractUploadFiles(attachments);

    if (files.length > 0) {
      const formData = new FormData();
      appendAttachmentUpdateFormData(formData, { message: body.message, removedAttachmentIds }, files);
      if (body.replyId !== undefined) {
        formData.append('replyId', body.replyId ?? '');
      }
      return await this.instance.patch<HeadquartersComment>(`/headquarters/comments/${id}`, formData);
    }

    return await this.instance.patch<HeadquartersComment>(`/headquarters/comments/${id}`, {
      ...body,
      ...(removedAttachmentIds?.length ? { removedAttachmentIds } : {}),
    });
  };

  deleteHeadquartersComment = async (id: string) => {
    return await this.instance.delete<{ message: string }>(`/headquarters/comments/${id}`);
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

  findChatMessages = async (chatId: string, dto: { take?: number; skip?: number } = {}) => {
    return await this.instance.get<PaginatedResponse<unknown>>(`/chats/${chatId}/messages`, {
      params: { take: 500, ...dto },
    });
  };

  sendChatMessage = async (
    chatId: string,
    body?: { content?: unknown; quoteMessageId?: string; attachments?: File[] },
  ) => {
    const files = extractUploadFiles(body?.attachments);

    if (files.length > 0) {
      const formData = new FormData();
      formData.append('content', JSON.stringify(body?.content ?? {}));
      if (body?.quoteMessageId) {
        formData.append('quoteMessageId', body.quoteMessageId);
      }
      files.forEach(file => {
        formData.append('attachments', file);
      });

      return await this.instance.post(`/chats/${chatId}/messages`, formData);
    }

    const { attachments: _attachments, ...jsonBody } = body ?? {};
    return await this.instance.post(`/chats/${chatId}/messages`, jsonBody);
  };

  updateChatMessage = async (chatId: string, messageId: string, dto: UpdateChatMessageDto = {}) => {
    const { attachments, removedAttachmentIds, ...body } = dto;
    const files = extractUploadFiles(attachments);

    if (files.length > 0) {
      const formData = new FormData();
      appendAttachmentUpdateFormData(formData, { content: body.content, removedAttachmentIds }, files);
      return await this.instance.patch(`/chats/${chatId}/messages/${messageId}`, formData);
    }

    return await this.instance.patch(`/chats/${chatId}/messages/${messageId}`, {
      ...body,
      ...(removedAttachmentIds?.length ? { removedAttachmentIds } : {}),
    });
  };

  deleteChatMessage = async (chatId: string, messageId: string) => {
    return await this.instance.delete<{ message: string; id: string; chatId: string }>(
      `/chats/${chatId}/messages/${messageId}`,
    );
  };

  leaveChat = async (chatId: string) => {
    return await this.instance.delete(`/chats/${chatId}/leave`);
  };

  deleteChat = async (chatId: string) => {
    return await this.instance.delete(`/chats/${chatId}`);
  };

  addChatMembers = async (chatId: string, dto: AddChatMembersDto) => {
    return await this.instance.post<Chat>(`/chats/${chatId}/members`, dto);
  };
}

export const api = new ApiModel();
