import axios from 'axios';
import { LoginDto, LoginResponse, Server, SignUpDto } from './types';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

class ApiModel {
  /* Servers */

  getServers = async () => {
    return await instance.get<Server[]>('/servers');
  };

  /* Auth */

  singUp = async (dto: SignUpDto) => {
    return await instance.post('/users/signup', dto);
  };

  login = async (dto: LoginDto) => {
    return await instance.post<LoginResponse>('/users/login', dto);
  };
}

export const api = new ApiModel();
