import { serversApi } from '@/shared/sdk';
import { Server } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';

class ServerInfoState {
  constructor() {
    makeAutoObservable(this);
  }

  servers: Server[] = [];

  fetchServers = async () => {
    try {
      const { data: servers } = await serversApi.findServers({ fetchActualInfo: true });
      this.servers = servers;
    } catch {
      this.servers = [];
    }
  };
}

export const serverInfoState = new ServerInfoState();
export { ServerInfoState };
