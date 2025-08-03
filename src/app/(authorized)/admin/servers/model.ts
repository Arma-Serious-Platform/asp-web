
import { ServerModel } from '@/entities/server/model';

import { makeAutoObservable } from 'mobx';


export class ServersModel {
  constructor() {
    makeAutoObservable(this);
  }

  server = new ServerModel();

}

export const serversModel = new ServersModel();
