import { Pagination } from '@/shared/model/pagination';
import { api } from '@/shared/sdk';
import { FindMissionsDto, Island, Mission, MissionStatus } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';

class MissionModel {
  constructor() {
    makeAutoObservable(this);
  }

  pagination = new Pagination({ api: api.findMissions });

  islands: Island[] = [];

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
      const { data } = await api.findIslands();

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

export { MissionModel };
