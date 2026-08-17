import { SquadModel } from '@/entities/squad/squad.model';
import { ManageSquadState } from '@/app/(authorized)/admin/squads/state/manage-squad.state';
import { squadsApi } from '@/shared/sdk';
import { FindSquadsDto, Squad } from '@/shared/sdk/types';
import { Pagination } from '@/shared/state/pagination';
import { makeAutoObservable } from 'mobx';

class SquadsPageState {
  constructor() {
    makeAutoObservable(this);
  }

  pagination = new Pagination<Squad, FindSquadsDto, SquadModel>({
    api: squadsApi.findSquads,
    Model: SquadModel,
  });

  init = async () => {
    await this.pagination.loadAll();
  };

  reset = () => {
    this.pagination.reset();
  };

  manageSquad = new ManageSquadState();
}

export const squadsPageState = new SquadsPageState();
