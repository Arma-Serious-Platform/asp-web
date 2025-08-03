import axios from 'axios';
import {
  BanUserDto,
  ChangePasswordDto,
  FindUsersDto,
  LoginDto,
  LoginResponse,
  PaginatedResponse,
  Server,
  SignUpDto,
  Squad,
  UpdateServerDto,
  User,
} from './types';
import { getCookie } from 'cookies-next';

class ApiModel {
  /* Servers */

  instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
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
  }

  /* Servers */

  findServers = async () => {
    return await this.instance.get<Server[]>('/servers');
  };

  updateServer = async ({ id, ...dto }: UpdateServerDto) => {
    return await this.instance.patch<Server>(`/servers/${id}`, dto);
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

  /* Users */

  getMe = async () => {
    return await this.instance.get<User>('/users/me');
  };

  findUsers = async (dto: FindUsersDto) => {
    return await this.instance.get<PaginatedResponse<User>>('/users', {
      params: dto,
    });
  };

  banUser = async (dto: BanUserDto) => {
    return await this.instance.post(`/users/ban/${dto.userId}`, dto);
  };

  unbanUser = async (userId: string) => {
    return await this.instance.post(`/users/unban/${userId}`);
  };

  /* Squads */

  findSquads = async () => {
    return await this.instance.get<Squad[]>('/squads');
  };
}

export const api = new ApiModel();
