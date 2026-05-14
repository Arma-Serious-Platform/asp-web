import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { makeAutoObservable } from 'mobx';

export class DeleteMissionModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  visibility = new Visibility<{
    missionId: string;
    missionName: string;
  }>();
}
