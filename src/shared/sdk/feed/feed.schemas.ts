import { z } from 'zod';
import { PaginatedRequest } from '../api-model';
import { News, NewsSchema } from '../news/news.schemas';
import { Weekend, WeekendSchema } from '../weekends/weekends.schemas';

export const FeedItemTypeSchema = z.enum(['news', 'weekends']);
export const FeedItemType = FeedItemTypeSchema.enum;
export type FeedItemType = z.infer<typeof FeedItemTypeSchema>;

export const FeedItemSchema = z
  .object({
    id: z.string(),
    type: FeedItemTypeSchema,
    data: z.union([NewsSchema, WeekendSchema]),
  })
  .passthrough();

export type FeedItem =
  | { id: string; type: 'news'; data: News }
  | { id: string; type: 'weekends'; data: Weekend };

export type FindFeedDto = PaginatedRequest;
