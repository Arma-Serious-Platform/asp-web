import { makeAutoObservable } from "mobx";
import { ChangeMissionVersionStatusModel } from "@/features/mission/change-mission-status/model";
import { CreateUpdateMissionVersionModel } from "@/features/mission/create-update-version/model";
import { UpdateMissionModel } from "@/features/mission/update-mission/model";

class MissionDetailsModel {
  constructor() {
    makeAutoObservable(this);
  }

  changeMissionVersionStatusModel = new ChangeMissionVersionStatusModel();
  createUpdateMissionVersionModel = new CreateUpdateMissionVersionModel();
  updateMissionModel = new UpdateMissionModel();
}

export { MissionDetailsModel };