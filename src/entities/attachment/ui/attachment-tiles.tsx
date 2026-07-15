'use client';

import { FC, useMemo, useState } from 'react';
import { DownloadIcon, EyeIcon, FileIcon, XIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import {
  downloadAttachment,
  downloadFile,
  getAttachmentUrl,
  isImageAttachment,
  isPreviewableAttachment,
  isVideoAttachment,
  MessageAttachmentItem,
} from '@/entities/attachment/lib';
import { MediaPreviewDialog } from '@/shared/ui/moleculas/media-preview-dialog';
import { AttachmentActionButton } from './attachment-action-button';

export type AttachmentTileItem = {
  id: string;
  name: string;
  url: string | null;
  mimeType?: string | null;
  file?: File;
  onRemove?: () => void;
};

type AttachmentTilesProps = {
  items: AttachmentTileItem[];
  className?: string;
  tileClassName?: string;
};

const toAttachmentLike = (item: AttachmentTileItem): MessageAttachmentItem => ({
  id: item.id,
  originalName: item.name,
  mimeType: item.mimeType,
  file: item.url ? { id: item.id, url: item.url } : undefined,
});

export const AttachmentTiles: FC<AttachmentTilesProps> = ({ items, className, tileClassName }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const previewableAttachments = useMemo(
    () => items.map(toAttachmentLike).filter(attachment => isPreviewableAttachment(attachment)),
    [items],
  );

  if (!items.length) return null;

  const openPreview = (item: AttachmentTileItem) => {
    const attachment = toAttachmentLike(item);
    const index = previewableAttachments.findIndex(entry => entry.id === attachment.id);
    if (index < 0) return;
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  const handleDownload = (item: AttachmentTileItem) => {
    if (item.file) {
      downloadFile(item.file);
      return;
    }

    downloadAttachment(toAttachmentLike(item));
  };

  return (
    <>
      <div className={cn('flex flex-wrap gap-2', className)}>
        {items.map(item => {
          const attachment = toAttachmentLike(item);
          const url = item.url ?? getAttachmentUrl(attachment);
          const previewable = isPreviewableAttachment(attachment);
          const isImage = isImageAttachment(attachment);
          const isVideo = isVideoAttachment(attachment);

          return (
            <div
              key={item.id}
              className={cn(
                'group relative h-24 w-24 overflow-hidden rounded-lg border border-white/10 bg-black/40',
                tileClassName,
              )}>
              {isImage && url ? (
                <img src={url} alt={item.name} className="size-full object-cover" />
              ) : isVideo && url ? (
                <video src={url} className="size-full object-cover" muted />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-1 px-2 text-center">
                  <FileIcon className="size-5 text-zinc-400" />
                  <span className="line-clamp-2 text-[10px] text-zinc-400">{item.name}</span>
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
                {previewable && url && (
                  <AttachmentActionButton label="Переглянути вкладення" onClick={() => openPreview(item)}>
                    <EyeIcon className="size-4" />
                  </AttachmentActionButton>
                )}
                <AttachmentActionButton label="Завантажити вкладення" onClick={() => handleDownload(item)}>
                  <DownloadIcon className="size-4" />
                </AttachmentActionButton>
              </div>

              {item.onRemove && (
                <button
                  type="button"
                  className="absolute right-1 top-1 cursor-pointer rounded-full border border-white/20 bg-black/80 p-1 text-zinc-200 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={item.onRemove}
                  aria-label={`Видалити ${item.name}`}>
                  <XIcon className="size-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <MediaPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        attachments={previewableAttachments}
        activeIndex={previewIndex}
        onActiveIndexChange={setPreviewIndex}
      />
    </>
  );
};
