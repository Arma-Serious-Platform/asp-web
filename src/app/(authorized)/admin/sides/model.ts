import { SideModel } from '@/entities/side/model';
import { ManageServerModel } from '@/features/servers/manage/model';

import { makeAutoObservable } from 'mobx';

export class SidesModel {
  constructor() {
    makeAutoObservable(this);
  }

  sides = new SideModel();

  manageServer = new ManageServerModel();
}

export const sidesModel = new SidesModel();
