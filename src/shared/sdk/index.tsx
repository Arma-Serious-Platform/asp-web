import axios from 'axios';
import {
  ChangePasswordDto,
  LoginDto,
  LoginResponse,
  Server,
  SignUpDto,
  Squad,
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

  getServers = async () => {
    return await this.instance.get<Server[]>('/servers');
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

  /* User */

  getMe = async () => {
    return await this.instance.get<User>('/users/me');
  };

  /* Squads */

  findSquads = async () => {
    return await this.instance.get<Squad[]>('/squads');
  };
}

export const api = new ApiModel();
