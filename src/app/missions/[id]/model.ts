import { makeAutoObservable } from "mobx";
import { ChangeMissionVersionStatusModel } from "@/features/mission/change-mission-status/model";
import { CreateUpdateMissionVersionModel } from "@/features/mission/create-update-version/model";

class MissionDetailsModel {
  constructor() {
    makeAutoObservable(this);
  }

  changeMissionVersionStatusModel = new ChangeMissionVersionStatusModel();
  createUpdateMissionVersionModel = new CreateUpdateMissionVersionModel();
}

export { MissionDetailsModel };