'use client';

import { env } from '@/shared/config/env';
import { ApiModel, type PaginatedResponse } from '../api-model';
import type {
  BanUserDto,
  ChangeNicknameDto,
  ChangeUserNicknameDto,
  ChangeUserRoleDto,
  CreateUserWarningDto,
  FindUsersDto,
  UpdateUserDto,
  User,
  UserHistoryEvent,
  UserPunishment,
  UserWarning,
} from './users.schemas';

export type * from './users.schemas';
export * from './users.schemas';

class UsersApi extends ApiModel {
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
    return await this.instance.post<User>(`/users/ban/${dto.userId}/${bannedUntil}`, {
      reason: dto.reason,
      mute: dto.mute === true,
    });
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

  changeUserRole = async (dto: ChangeUserRoleDto) => {
    return await this.instance.put<User>('/users/change-role', dto);
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

  findUserHistory = async (userId: string) => {
    return await this.instance.get<UserHistoryEvent[]>(`/users/${userId}/history`);
  };
}

export const usersApi = new UsersApi();
export { UsersApi };
