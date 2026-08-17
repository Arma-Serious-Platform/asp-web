import { Loader } from '@/shared/state/loader';
import { Visibility } from '@/shared/state/visibility';
import { makeAutoObservable } from 'mobx';

export class DeleteMissionCommentState {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  visibility = new Visibility<{
    comment: { id: string };
  }>();
}
