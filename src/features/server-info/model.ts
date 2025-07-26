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
    const { data: servers } = await api.getServers();

    this.servers = servers;
  }
}

const serverInfo = new ServerInfoModel();

export { serverInfo, ServerInfoModel }