import axios from 'axios';
import { LoginDto, LoginResponse, Server, SignUpDto, User } from './types';
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

  login = async (dto: LoginDto) => {
    return await this.instance.post<LoginResponse>('/users/login', dto);
  };

  /* User */

  getMe = async () => {
    return await this.instance.get<User>('/users/me');
  };
}

export const api = new ApiModel();
