import { makeAutoObservable } from 'mobx';
import { ChangeMissionVersionStatusModel } from '@/features/mission/change-mission-status/model';
import { CreateUpdateMissionVersionModel } from '@/features/mission/create-update-version/model';
import { UpdateMissionModel } from '@/features/mission/update-mission/model';
import { MissionCommentsModel } from '@/entities/mission/comments/model';
import { ChangeMissionStateModel } from '@/features/mission/change-mission-state';

class MissionDetailsModel {
  constructor() {
    makeAutoObservable(this);
  }

  changeMissionVersionStatusModel = new ChangeMissionVersionStatusModel();
  createUpdateMissionVersionModel = new CreateUpdateMissionVersionModel();
  updateMissionModel = new UpdateMissionModel();
  changeMissionStateModel = new ChangeMissionStateModel();
  commentModel = new MissionCommentsModel();
}

export { MissionDetailsModel };
