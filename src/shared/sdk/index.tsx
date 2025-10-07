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
  Server,
  Side,
  SignUpDto,
  Squad,
  UpdateServerDto,
  UpdateSquadDto,
  User,
} from './types';
import { deleteCookie, getCookie } from 'cookies-next';

import { ROUTES } from '../config/routes';
import { env } from '../config/env';

class ApiModel {
  /* Servers */

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

    this.instance.interceptors.response.use(async (response) => {
      // TODO: call refresh token
      const isClient = typeof window !== 'undefined';

      if (response.status === 401) {
        if (isClient) {
          deleteCookie('token');
          deleteCookie('refreshToken');

          window.location.href = ROUTES.auth.login;
        } else {
          deleteCookie('token');
          deleteCookie('refreshToken');
          // redirect(ROUTES.auth.login);
        }
      }

      return response;
    });
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

  login = async (dto: LoginDto) => {
    return await this.instance.post<LoginResponse>('/users/login', dto);
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
    return await this.instance.patch<Squad>(`/squads/${id}`, dto);
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
