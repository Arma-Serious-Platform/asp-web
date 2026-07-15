import { MessageAttachmentItem, MissionCommentMessage, User } from '@/shared/sdk/types';

export type CommentViewModel = {
  id: string;
  userId?: string;
  message: MissionCommentMessage;
  updatedAt: string;
  createdAt?: string;
  user?: User;
  attachments?: MessageAttachmentItem[];
};
