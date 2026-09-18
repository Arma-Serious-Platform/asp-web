'use client';

import { ApiModel, type PaginatedResponse } from '../api-model';
import type { FeedItem, FindFeedDto } from './feed.schemas';

export type * from './feed.schemas';
export * from './feed.schemas';

class FeedApi extends ApiModel {
  findFeed = async (dto: FindFeedDto = {}) => {
    return await this.instance.get<PaginatedResponse<FeedItem>>('/feed', { params: dto });
  };
}

export const feedApi = new FeedApi();
export { FeedApi };
