'use client';

import { ApiModel } from '../api-model';
import type { CreateServerDto, FindServersDto, Server, UpdateServerDto } from './servers.schemas';

export type * from './servers.schemas';
export * from './servers.schemas';

class ServersApi extends ApiModel {
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
}

export const serversApi = new ServersApi();
export { ServersApi };
