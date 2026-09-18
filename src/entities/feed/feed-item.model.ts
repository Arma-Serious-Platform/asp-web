import { createEntity } from '@/shared/state/entity';
import { FeedItemSchema } from '@/shared/sdk/feed/feed.schemas';
import { makeObservable, computed } from 'mobx';

class FeedItemModel extends createEntity(FeedItemSchema) {
  protected init() {
    makeObservable(this, {
      id: computed,
      type: computed,
    });
  }

  get id() {
    return this.data.id;
  }

  get type() {
    return this.data.type;
  }
}

export { FeedItemModel };
