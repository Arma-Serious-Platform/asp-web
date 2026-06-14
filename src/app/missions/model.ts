import { MissionModel } from '@/entities/mission/model';
import { findMissionReviewersParams, findUsersWithMissionParams } from '@/entities/user/lib';
import { UserModel } from '@/entities/user/model';
import { FindMissionsDto } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';
import { CreateMissionModel } from '@/features/mission/create-mission/model';

class MissionsPageModel {
  constructor() {
    makeAutoObservable(this);
  }

  userModel = new UserModel();
  reviewerUserModel = new UserModel();
  missionModel = new MissionModel();
  createMissionModel = new CreateMissionModel();

  init = async (dto: FindMissionsDto) => {
    try {
      this.missionModel.getIslands();
      await this.missionModel.init(dto);
      await Promise.all([
        this.userModel.pagination.loadAll(findUsersWithMissionParams({ take: 100 })),
        this.reviewerUserModel.pagination.loadAll(findMissionReviewersParams({ take: 100 })),
      ]);
    } catch {
      toast.error('Не вдалося завантажити місії та острови');
    }
  };
}

export const model = new MissionsPageModel();
