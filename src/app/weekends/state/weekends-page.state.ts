'use client';

import { makeAutoObservable } from 'mobx';

import { FeedItemModel } from '@/entities/feed';
import { feedApi } from '@/shared/sdk';
import { FeedItem, FindFeedDto } from '@/shared/sdk/feed/feed.schemas';
import { Pagination } from '@/shared/state/pagination';

class WeekendsPageState {
  constructor() {
    makeAutoObservable(this);
  }

  pagination = new Pagination<FeedItem, FindFeedDto, FeedItemModel>({
    api: feedApi.findFeed,
    Model: FeedItemModel,
  });

  init = async () => {
    await this.pagination.init({
      take: 5,
    });
  };

  reset = () => {
    this.pagination.reset();
  };
}

export const weekendsPageState = new WeekendsPageState();
