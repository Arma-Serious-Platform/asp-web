import { MissionModel } from '@/entities/mission/mission.model';

import { UserModel } from '@/entities/user/user.model';
import { islandsApi, missionsApi, usersApi } from '@/shared/sdk';
import { FindMissionsDto, FindUsersDto, Island, Mission, User } from '@/shared/sdk/types';
import { Pagination } from '@/shared/state/pagination';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';
import { CreateMissionState } from './create-mission.state';

const findUsersWithMissionParams = (params: Partial<FindUsersDto> = {}): FindUsersDto => ({
  hasMission: true,
  take: 50,
  skip: 0,
  ...params,
});

const findMissionReviewersParams = (params: Partial<FindUsersDto> = {}): FindUsersDto => ({
  canReviewMissions: true,
  take: 50,
  skip: 0,
  ...params,
});

class MissionsPageState {
  constructor() {
    makeAutoObservable(this);
  }

  missionsPagination = new Pagination<Mission, FindMissionsDto, MissionModel>({
    api: missionsApi.findMissions,
    Model: MissionModel,
  });

  authorsPagination = new Pagination<User, FindUsersDto, UserModel>({
    api: usersApi.findUsers,
    Model: UserModel,
  });

  reviewersPagination = new Pagination<User, FindUsersDto, UserModel>({
    api: usersApi.findUsers,
    Model: UserModel,
  });

  islands: Island[] = [];

  createMissionState = new CreateMissionState();

  get islandsOptions() {
    return this.islands.map(island => ({
      value: island.id,
      label: island.name,
    }));
  }

  getIslands = async () => {
    try {
      const { data } = await islandsApi.findIslands();
      this.islands = data;
    } catch (error) {
      console.log(error);
    }
  };

  init = async (dto: FindMissionsDto) => {
    try {
      this.getIslands();
      await this.missionsPagination.init(dto);
      await Promise.all([
        this.authorsPagination.loadAll(findUsersWithMissionParams({ take: 100 })),
        this.reviewersPagination.loadAll(findMissionReviewersParams({ take: 100 })),
      ]);
    } catch {
      toast.error('Не вдалося завантажити місії та острови');
    }
  };
}

export const missionsState = new MissionsPageState();
