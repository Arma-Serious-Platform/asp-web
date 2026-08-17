import { MissionCommentsState } from '@/app/missions/[id]/state/mission-comments.state';
import { makeAutoObservable } from 'mobx';
import { ChangeMissionVersionStatusState } from './change-mission-status.state';
import { ChangeMissionStateState } from './change-mission-state.state';
import { CreateUpdateMissionVersionState } from './create-update-version.state';
import { UpdateMissionState } from './update-mission.state';

class MissionDetailsState {
  constructor() {
    makeAutoObservable(this);
  }

  changeMissionVersionStatusState = new ChangeMissionVersionStatusState();
  createUpdateMissionVersionState = new CreateUpdateMissionVersionState();
  updateMissionState = new UpdateMissionState();
  changeMissionStateState = new ChangeMissionStateState();
  commentModel = new MissionCommentsState();
}

export { MissionDetailsState };
