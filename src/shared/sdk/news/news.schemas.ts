import { z } from 'zod';
import {
  PaginatedRequest,
  UserRoleSchema,
  SquadRoleSchema,
  SideTypeSchema,
  dateLikeSchema,
  fileRefSchema,
  missionCommentMessageSchema,
  messageAttachmentItemSchema,
} from '../api-model';

export const NewsTypeSchema = z.enum(['INFO', 'TECH_UPDATE']);
export const NewsType = NewsTypeSchema.enum;
export type NewsType = z.infer<typeof NewsTypeSchema>;

const NewsAuthorSchema = z
  .object({
    id: z.string(),
    nickname: z.string(),
    roles: z.array(UserRoleSchema).default([]),
    avatar: fileRefSchema.nullable().optional(),
    squadRole: SquadRoleSchema.optional(),
    squad: z
      .object({
        id: z.string().optional(),
        tag: z.string().optional(),
        side: z
          .object({
            type: SideTypeSchema.optional(),
          })
          .optional(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();

export const NewsAttachmentSchema = z
  .object({
    id: z.string(),
    originalName: z.string(),
    mimeType: z.string().nullable().optional(),
    file: messageAttachmentItemSchema.shape.file.optional(),
  })
  .passthrough();
export type NewsAttachment = z.infer<typeof NewsAttachmentSchema>;

export const NewsSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    shortDescription: missionCommentMessageSchema.nullable().optional(),
    content: missionCommentMessageSchema,
    published: z.boolean(),
    type: NewsTypeSchema,
    date: dateLikeSchema,
    authorId: z.string(),
    lastEditedById: z.string(),
    imageId: z.string().nullable().optional(),
    image: fileRefSchema.nullable().optional(),
    author: NewsAuthorSchema.optional(),
    lastEditedBy: NewsAuthorSchema.optional(),
    attachments: z.array(NewsAttachmentSchema).optional().default([]),
    createdAt: dateLikeSchema.optional(),
    updatedAt: dateLikeSchema.optional(),
  })
  .passthrough();
export type News = z.infer<typeof NewsSchema>;

export type FindNewsDto = PaginatedRequest<{
  search?: string;
  type?: NewsType;
  authorId?: string;
  dateFrom?: string;
  dateTo?: string;
  published?: boolean;
}>;

export type CreateNewsDto = {
  title: string;
  shortDescription?: Record<string, unknown> | null;
  content: Record<string, unknown>;
  published?: boolean;
  type?: NewsType;
  date?: string;
  image?: File | null;
  attachments?: File[];
};

export type UpdateNewsDto = {
  id: string;
  title?: string;
  shortDescription?: Record<string, unknown> | null;
  content?: Record<string, unknown>;
  published?: boolean;
  type?: NewsType;
  date?: string;
  image?: File | null;
  removeImage?: boolean;
  attachments?: File[];
  removedAttachmentIds?: string[];
};
