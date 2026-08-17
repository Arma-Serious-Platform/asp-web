import { z } from 'zod';
import { fileSchema, missionCommentMessageSchema } from '../api-model';

export const ChatTypeSchema = z.enum(['DIRECT', 'GROUP']);
export const ChatType = ChatTypeSchema.enum;
export type ChatType = z.infer<typeof ChatTypeSchema>;

export const ChatSchema = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    type: ChatTypeSchema,
    creatorId: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough();
export type Chat = z.infer<typeof ChatSchema>;

export const CreateChatDtoSchema = z.object({
  type: ChatTypeSchema,
  userIds: z.array(z.string()),
  name: z.string().optional(),
});
export type CreateChatDto = z.infer<typeof CreateChatDtoSchema>;

export const AddChatMembersDtoSchema = z.object({
  userIds: z.array(z.string()),
});
export type AddChatMembersDto = z.infer<typeof AddChatMembersDtoSchema>;

export const UpdateChatMessageDtoSchema = z.object({
  content: missionCommentMessageSchema.optional(),
  attachments: z.array(fileSchema).optional(),
  removedAttachmentIds: z.array(z.string()).optional(),
});
export type UpdateChatMessageDto = z.infer<typeof UpdateChatMessageDtoSchema>;
