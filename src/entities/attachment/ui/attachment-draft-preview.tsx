'use client';

import { FC, useEffect, useMemo } from 'react';
import { cn } from '@/shared/utils/cn';
import { isPreviewableUploadFile } from '@/entities/attachment/lib';
import { AttachmentTiles, AttachmentTileItem } from './attachment-tiles';

type AttachmentDraftPreviewProps = {
  files: File[];
  onRemove: (index: number) => void;
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

export const AttachmentDraftPreview: FC<AttachmentDraftPreviewProps> = ({ files, onRemove, className }) => {
  const items = useMemo(() => files.map(buildDraftPreviewItem), [files]);

  useEffect(() => {
    return () => {
      items.forEach(item => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [items]);

  if (!files.length) return null;

  const tileItems: AttachmentTileItem[] = items.map((item, index) => ({
    id: `${item.file.name}-${index}`,
    name: item.file.name,
    url: item.previewUrl,
    mimeType: item.file.type,
    file: item.file,
    onRemove: () => onRemove(index),
  }));

  return (
    <div className={cn('border-t border-white/10 bg-black/30 px-3 py-2', className)}>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Вкладення</div>
      <AttachmentTiles items={tileItems} tileClassName="h-20 w-20" />
    </div>
  );
};
