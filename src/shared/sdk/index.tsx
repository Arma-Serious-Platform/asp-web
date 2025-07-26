import axios from 'axios';
import { Server } from './types';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

class ApiModel {
  getServers = async () => {
    return await instance.get<Server[]>('/servers');
  };
}

export const api = new ApiModel();
