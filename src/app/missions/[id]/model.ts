import { makeAutoObservable } from "mobx";
import { ChangeMissionVersionStatusModel } from "@/features/mission/change-mission-status/model";

class MissionDetailsModel {
  constructor() {
    makeAutoObservable(this);
  }

  changeMissionVersionStatusModel = new ChangeMissionVersionStatusModel();
}

export { MissionDetailsModel };