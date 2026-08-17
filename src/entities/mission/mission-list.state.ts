import { Pagination } from '@/shared/state/pagination';
import { islandsApi, missionsApi } from '@/shared/sdk';
import { FindMissionsDto, Island, Mission } from '@/shared/sdk/types';
import { MissionModel } from './mission.model';
import { makeAutoObservable } from 'mobx';

/**
 * @deprecated Prefer page state + Pagination with MissionModel.
 */
class MissionsState {
  constructor() {
    makeAutoObservable(this);
  }

  pagination = new Pagination<Mission, FindMissionsDto, MissionModel>({
    api: missionsApi.findMissions,
    Model: MissionModel,
  });

  islands: Island[] = [];

  get options() {
    return this.pagination.data.map(mission => ({
      value: mission.id,
      label: mission.name,
    }));
  }

  get islandsOptions() {
    return this.islands.map(island => ({
      value: island.id,
      label: island.name,
    }));
  }

  init = async (dto: FindMissionsDto) => {
    await this.pagination.init(dto);
    return this.pagination.data;
  };

  getIslands = async () => {
    try {
      const { data } = await islandsApi.findIslands();
      this.islands = data;
    } catch (error) {
      console.log(error);
    }
  };

  reset = () => {
    this.pagination.reset();
    this.islands = [];
  };
}

export { MissionsState };
