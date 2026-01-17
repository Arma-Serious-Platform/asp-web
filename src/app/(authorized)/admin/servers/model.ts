import { ServerModel } from '@/entities/server/model';
import { ManageServerModel } from '@/features/servers/manage/model';

import { makeAutoObservable } from 'mobx';

export class ServersModel {
  constructor() {
    makeAutoObservable(this);
  }

  server = new ServerModel();

  manageServer = new ManageServerModel();
}

export const serversModel = new ServersModel();
