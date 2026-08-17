import { createEntity } from '@/shared/state/entity';
import { WeekendSchema } from '@/shared/sdk/types';
import { makeObservable, computed } from 'mobx';

class WeekendModel extends createEntity(WeekendSchema) {
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

export { WeekendModel };
