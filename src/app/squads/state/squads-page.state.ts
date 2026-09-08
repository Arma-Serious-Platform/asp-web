import { SidesState } from '@/entities/side/side-list.state';
import { SquadModel } from '@/entities/squad/squad.model';
import { squadsApi } from '@/shared/sdk';
import { SideType } from '@/shared/sdk/types';
import { Pagination } from '@/shared/state/pagination';
import { makeAutoObservable } from 'mobx';

class SquadsPageState {
  constructor() {
    makeAutoObservable(this);
  }

  squads = new Pagination({
    api: squadsApi.findSquads,
    Model: SquadModel,
  });

  sides = new SidesState();

  init = async () => {
    await Promise.all([this.squads.init(), this.sides.pagination.loadAll()]);
  };

  get blueSide() {
    return this.sides.pagination.data.find(side => side.data.type === SideType.BLUE);
  }

  get redSide() {
    return this.sides.pagination.data.find(side => side.data.type === SideType.RED);
  }

  get blueSquads() {
    return this.squads.data.filter(squad => squad.sideType === SideType.BLUE);
  }

  get redSquads() {
    return this.squads.data.filter(squad => squad.sideType === SideType.RED);
  }

  get unassignedSquads() {
    return this.squads.data.filter(squad => squad.sideType === SideType.UNASSIGNED);
  }

  get blueStats() {
    return this.getSideSquadStats(this.blueSquads);
  }

  get redStats() {
    return this.getSideSquadStats(this.redSquads);
  }

  get unassignedStats() {
    return this.getSideSquadStats(this.unassignedSquads);
  }

  private getSideSquadStats = (squads: SquadModel[]) => {
    return squads.reduce(
      (stats, squad) => ({
        active: stats.active + (squad.data.activeCount ?? 0),
        total: stats.total + (squad.data._count?.members ?? squad.data.members?.length ?? 0),
      }),
      { active: 0, total: 0 },
    );
  };
}

export const squadsPageState = new SquadsPageState();
