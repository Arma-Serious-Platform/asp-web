import { SquadModel } from '@/entities/squad/model';
import { ManageServerModel } from '@/features/servers/manage/model';

import { makeAutoObservable } from 'mobx';

export class SquadsPageModel {
  constructor() {
    makeAutoObservable(this);
  }

  squads = new SquadModel();

  init = async () => {
    await this.squads.init();
  };

  reset = () => {
    this.squads.reset();
  };

  manageServer = new ManageServerModel();
}

export const squadsPageModel = new SquadsPageModel();
