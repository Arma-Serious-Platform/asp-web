'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Dialog, DialogContent } from '@/shared/ui/organisms/dialog';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { FC, ReactNode, useEffect } from 'react';
import { isImageAttachment, isVideoAttachment, MessageAttachmentItem } from '@/entities/attachment/lib';

type MediaPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attachments: MessageAttachmentItem[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  footer?: ReactNode;
};

const previewDialogClassName =
  'flex h-[85vh] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-2rem)] gap-0 overflow-hidden p-2';

export const MediaPreviewDialog: FC<MediaPreviewDialogProps> = ({
  open,
  onOpenChange,
  attachments,
  activeIndex,
  onActiveIndexChange,
  footer,
}) => {
  const previewableAttachments = attachments.filter(
    attachment => isImageAttachment(attachment) || isVideoAttachment(attachment),
  );
  const activeAttachment = previewableAttachments[activeIndex];
  const activeUrl = activeAttachment?.file?.url ?? null;
  const canNavigate = previewableAttachments.length > 1;

  useEffect(() => {
    if (!open || !canNavigate) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onActiveIndexChange(activeIndex === 0 ? previewableAttachments.length - 1 : activeIndex - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        onActiveIndexChange(
          activeIndex === previewableAttachments.length - 1 ? 0 : activeIndex + 1,
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, canNavigate, activeIndex, onActiveIndexChange, previewableAttachments.length]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className={previewDialogClassName}>
        {activeUrl ? (
          <div className="relative min-h-0 min-w-0 flex-1">
            {isVideoAttachment(activeAttachment) ? (
              <video src={activeUrl} controls className="size-full object-contain" />
            ) : (
              <img
                src={activeUrl}
                alt={activeAttachment.originalName}
                className="size-full object-contain"
              />
            )}
            {canNavigate && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  onClick={() =>
                    onActiveIndexChange(activeIndex === 0 ? previewableAttachments.length - 1 : activeIndex - 1)
                  }>
                  <ChevronLeftIcon className="size-5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() =>
                    onActiveIndexChange(
                      activeIndex === previewableAttachments.length - 1 ? 0 : activeIndex + 1,
                    )
                  }>
                  <ChevronRightIcon className="size-5" />
                </Button>
              </>
            )}
            {footer}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
