import axios from 'axios';
import {
  BanUserDto,
  ChangePasswordDto,
  ConfirmForgotPasswordDto,
  CreateServerDto,
  CreateSquadDto,
  FindServersDto,
  FindSidesDto,
  FindSquadsDto,
  FindUsersDto,
  ForgotPasswordDto,
  LoginDto,
  LoginResponse,
  PaginatedResponse,
  RefreshTokenDto,
  Server,
  Side,
  SignUpDto,
  Squad,
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

  /* Sides */

  findSides = async (dto: FindSidesDto) => {
    return await this.instance.get<PaginatedResponse<Side>>('/sides', {
      params: dto,
    });
  };
}

export const api = new ApiModel();
