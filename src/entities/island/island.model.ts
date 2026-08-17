import { createEntity } from '@/shared/state/entity';
import { IslandSchema } from '@/shared/sdk/types';
import { makeObservable, computed } from 'mobx';

class IslandModel extends createEntity(IslandSchema) {
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

export { IslandModel };
