import { Loader } from '@/shared/state/loader';
import { Visibility } from '@/shared/state/visibility';
import { makeAutoObservable } from 'mobx';

export class DeleteMissionState {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  visibility = new Visibility<{
    missionId: string;
    missionName: string;
  }>();
}
