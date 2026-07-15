'use client';

import { FC, useEffect, useMemo } from 'react';
import { cn } from '@/shared/utils/cn';
import { isPreviewableUploadFile, MessageAttachmentItem } from '@/entities/attachment/lib';
import { AttachmentTiles, AttachmentTileItem } from './attachment-tiles';

type AttachmentEditPreviewProps = {
  existingAttachments?: MessageAttachmentItem[];
  removedAttachmentIds: string[];
  onRemoveExisting: (attachmentId: string) => void;
  files: File[];
  onRemoveNew: (index: number) => void;
  className?: string;
};

type DraftPreviewItem = {
  file: File;
  previewUrl: string | null;
};

const buildDraftPreviewItem = (file: File): DraftPreviewItem => {
  if (isPreviewableUploadFile(file)) {
    return {
      file,
      previewUrl: URL.createObjectURL(file),
    };
  }

  return { file, previewUrl: null };
};

export const AttachmentEditPreview: FC<AttachmentEditPreviewProps> = ({
  existingAttachments = [],
  removedAttachmentIds,
  onRemoveExisting,
  files,
  onRemoveNew,
  className,
}) => {
  const draftItems = useMemo(() => files.map(buildDraftPreviewItem), [files]);

  useEffect(() => {
    return () => {
      draftItems.forEach(item => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [draftItems]);

  const removedSet = useMemo(() => new Set(removedAttachmentIds), [removedAttachmentIds]);

  const existingTiles: AttachmentTileItem[] = existingAttachments
    .filter(attachment => !removedSet.has(attachment.id))
    .map(attachment => ({
      id: attachment.id,
      name: attachment.originalName,
      url: attachment.file?.url ?? null,
      mimeType: attachment.mimeType,
      onRemove: () => onRemoveExisting(attachment.id),
    }));

  const draftTiles: AttachmentTileItem[] = draftItems.map((item, index) => ({
    id: `draft-${item.file.name}-${index}`,
    name: item.file.name,
    url: item.previewUrl,
    mimeType: item.file.type,
    file: item.file,
    onRemove: () => onRemoveNew(index),
  }));

  const items = [...existingTiles, ...draftTiles];

  if (!items.length) return null;

  return (
    <div className={cn('border-t border-white/10 bg-black/30 px-3 py-2', className)}>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Вкладення</div>
      <AttachmentTiles items={items} tileClassName="h-20 w-20" />
    </div>
  );
};
