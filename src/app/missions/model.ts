import { MissionModel } from '@/entities/mission/model';
import { UserModel } from '@/entities/user/model';
import { FindMissionsDto } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

class MissionsPageModel {
  constructor() {
    makeAutoObservable(this);
  }

  userModel = new UserModel();
  missionModel = new MissionModel();

  init = async (dto: FindMissionsDto) => {
    try {
      this.missionModel.getIslands();
      await this.missionModel.init(dto);
      await this.userModel.pagination.init({
       take: 100, 
      });
    } catch {
      toast.error('Не вдалося завантажити місії та острови');
    }
  };
}

export const model = new MissionsPageModel();
