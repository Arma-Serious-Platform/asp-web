import { createEntity } from '@/shared/state/entity';
import { MissionCommentSchema } from '@/shared/sdk/types';
import { makeObservable, computed } from 'mobx';

class MissionCommentModel extends createEntity(MissionCommentSchema) {
  protected init() {
    makeObservable(this, {
      id: computed,
    });
  }

  get id() {
    return this.data.id;
  }
}

export { MissionCommentModel };
