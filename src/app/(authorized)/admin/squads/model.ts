import { SquadModel } from '@/entities/squad/model';

import { ManageSquadModel } from '@/features/squads/manage/model';

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

  manageSquad = new ManageSquadModel();
}

export const squadsPageModel = new SquadsPageModel();
