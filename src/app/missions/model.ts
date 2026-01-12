import { MissionModel } from "@/entities/mission/model";
import { UserModel } from "@/entities/user/model";
import { makeAutoObservable } from "mobx";

class MissionsPageModel {
  constructor() {
    makeAutoObservable(this);
  }

  userModel = new UserModel();
  missionModel = new MissionModel();

  init = async () => {
    await this.missionModel.init();
    await this.userModel.pagination.loadAll();
  };
}

export const model = new MissionsPageModel();