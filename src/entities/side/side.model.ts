import { createEntity } from '@/shared/state/entity';
import { SideSchema } from '@/shared/sdk/types';
import { makeObservable, computed } from 'mobx';

class SideModel extends createEntity(SideSchema) {
  protected init() {
    makeObservable(this, {
      id: computed,
      name: computed,
    });
  }

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }
}

export { SideModel };
