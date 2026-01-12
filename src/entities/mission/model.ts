import { Pagination } from '@/shared/model/pagination';
import { api } from '@/shared/sdk';
import { Mission, MissionStatus } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';

class MissionModel {
  constructor() {
    makeAutoObservable(this);
  }

  pagination = new Pagination({ api: api.findMissions });

  get missions() {
    return this.pagination.data;
  }

  get filteredMissions() {
    return this.pagination.data.filter((mission) => {
      if (this.statusFilter && mission.missionVersions?.[0]?.status !== this.statusFilter) {
        return false;
      }
      if (this.authorIdFilter && mission.authorId !== this.authorIdFilter) {
        return false;
      }
      if (this.minSlotsFilter !== null) {
        const maxSlots = Math.max(
          ...mission.missionVersions?.map(
            (v) => v.attackSideSlots + v.defenseSideSlots
          )
        );
        if (maxSlots < this.minSlotsFilter) {
          return false;
        }
      }
      if (this.maxSlotsFilter !== null) {
        const maxSlots = Math.max(
          ...mission.missionVersions?.map(
            (v) => v.attackSideSlots + v.defenseSideSlots
          )
        );
        if (maxSlots > this.maxSlotsFilter) {
          return false;
        }
      }
      return true;
    });
  }

  statusFilter: MissionStatus | null = null;
  authorIdFilter: string | null = null;
  minSlotsFilter: number | null = null;
  maxSlotsFilter: number | null = null;

  setStatusFilter = (status: MissionStatus | null) => {
    this.statusFilter = status;
  };

  setAuthorIdFilter = (authorId: string | null) => {
    this.authorIdFilter = authorId;
  };

  setMinSlotsFilter = (minSlots: number | null) => {
    this.minSlotsFilter = minSlots;
  };

  setMaxSlotsFilter = (maxSlots: number | null) => {
    this.maxSlotsFilter = maxSlots;
  };

  init = async () => {
    await this.pagination.loadAll();

    return this.pagination.data;
  };

  reset = () => {
    this.pagination.reset();
    this.statusFilter = null;
    this.authorIdFilter = null;
    this.minSlotsFilter = null;
    this.maxSlotsFilter = null;
  };
}

export { MissionModel };

