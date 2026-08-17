'use client';

import { FC, useMemo } from 'react';
import { cn } from '@/shared/utils/cn';
import type { MessageAttachmentItem } from './attachment';
import { AttachmentTiles } from './attachment-tiles';

export type { MessageAttachmentItem };
export {
  resolveAttachmentMimeType,
  isImageAttachment,
  isVideoAttachment,
  isPreviewableAttachment,
  getAttachmentUrl,
  downloadAttachment,
  downloadFile,
  isPreviewableUploadFile,
  normalizeMessageAttachments,
} from './attachment';

type MessageAttachmentsProps = {
  attachments?: MessageAttachmentItem[];
  className?: string;
};

export const MessageAttachments: FC<MessageAttachmentsProps> = ({ attachments = [], className }) => {
  const items = useMemo(
    () =>
      attachments.map(attachment => ({
        id: attachment.id,
        name: attachment.originalName,
        url: attachment.file?.url ?? null,
        mimeType: attachment.mimeType,
      })),
    [attachments],
  );

  if (!items.length) return null;

  return <AttachmentTiles items={items} className={cn('mt-2', className)} />;
};
