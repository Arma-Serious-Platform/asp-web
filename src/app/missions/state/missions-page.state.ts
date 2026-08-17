import { MissionModel } from '@/entities/mission/mission.model';

import { UserModel } from '@/entities/user/user.model';
import { islandsApi, missionsApi, usersApi } from '@/shared/sdk';
import { FindMissionsDto, FindUsersDto, Island, Mission, User } from '@/shared/sdk/types';
import { Pagination } from '@/shared/state/pagination';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';
import { CreateMissionState } from './create-mission.state';
import { Loader } from '@/shared/state/loader';

export const MISSIONS_PAGE_SIZE = 10;

class MissionsPageState {
  constructor() {
    makeAutoObservable(this);
  }

  pageLoader = new Loader(true);

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

  private findUsersWithMissionParams = (params: Partial<FindUsersDto> = {}): FindUsersDto => ({
    hasMission: true,
    ...params,
  });

  private findMissionReviewersParams = (params: Partial<FindUsersDto> = {}): FindUsersDto => ({
    canReviewMissions: true,
    ...params,
  });

  init = async (dto: FindMissionsDto) => {
    try {
      this.getIslands();
      await this.missionsPagination.init(dto);
      await Promise.all([
        this.authorsPagination.loadAll(this.findUsersWithMissionParams()),
        this.reviewersPagination.loadAll(this.findMissionReviewersParams()),
      ]);
    } catch {
      toast.error('Не вдалося завантажити місії та острови');
    } finally {
      this.pageLoader.clear();
    }
  };
}

export const missionsState = new MissionsPageState();
