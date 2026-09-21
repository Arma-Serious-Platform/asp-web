import { createEntity } from '@/shared/state/entity';
import { NewsSchema, NewsType } from '@/shared/sdk/news/news.schemas';
import { makeObservable, computed } from 'mobx';

export const NEWS_TYPE_LABELS: Record<NewsType, string> = {
  [NewsType.INFO]: 'Інфо',
  [NewsType.TECH_UPDATE]: 'Тех. оновлення',
  [NewsType.WEBSITE_UPDATE]: 'Оновлення сайту',
};

class NewsModel extends createEntity(NewsSchema) {
  protected init() {
    makeObservable(this, {
      id: computed,
      title: computed,
      typeLabel: computed,
    });
  }

  get id() {
    return this.data.id;
  }

  get title() {
    return this.data.title;
  }

  get typeLabel() {
    return NEWS_TYPE_LABELS[this.data.type] ?? this.data.type;
  }
}

export { NewsModel };
