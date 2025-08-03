import { api } from '@/shared/sdk';
import { Server } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';

class ServerInfoModel {
  constructor(
  ) {
    makeAutoObservable(this);
  }

  public servers: Server[] = [];

  public async fetchServers() {
    try {
      const { data: servers } = await api.findServers();

      this.servers = servers;
    } catch {
      this.servers = [];
    }
  }
}

const serverInfo = new ServerInfoModel();

export { serverInfo, ServerInfoModel }