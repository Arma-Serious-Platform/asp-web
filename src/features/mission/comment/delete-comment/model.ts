import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { MissionComment } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';

export class DeleteMissionCommentModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  visibility = new Visibility<{
    comment: MissionComment;
  }>();
}

