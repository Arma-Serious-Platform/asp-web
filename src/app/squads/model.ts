import { SquadModel } from '@/entities/squad/model';
import { makeAutoObservable } from 'mobx';

class SquadsPageModel {
  constructor() {
    makeAutoObservable(this);
  }

  squads = new SquadModel();
}

const squadsPageModel = new SquadsPageModel();

export { squadsPageModel };
