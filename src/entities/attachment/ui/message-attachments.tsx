'use client';

import { FC, useMemo } from 'react';
import { cn } from '@/shared/utils/cn';
import { MessageAttachmentItem } from '@/entities/attachment/lib';
import { AttachmentTiles } from './attachment-tiles';

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
