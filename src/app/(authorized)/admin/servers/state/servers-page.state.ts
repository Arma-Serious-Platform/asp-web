import { ServerListState } from '@/entities/server/server-list.state';
import { ManageServerState } from '@/app/(authorized)/admin/servers/state/manage-server.state';
import { makeAutoObservable } from 'mobx';

class ServersPageState {
  constructor() {
    makeAutoObservable(this);
  }

  server = new ServerListState();

  manageServer = new ManageServerState();
}

export const serversPageState = new ServersPageState();
