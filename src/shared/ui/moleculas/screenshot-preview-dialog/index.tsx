'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Dialog, DialogContent } from '@/shared/ui/organisms/dialog';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { FC, ReactNode, useEffect } from 'react';

type ScreenshotPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  alt?: string;
  canNavigate?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  footer?: ReactNode;
};

const previewDialogClassName =
  'flex h-[85vh] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-2rem)] gap-0 overflow-hidden p-2';

export const ScreenshotPreviewDialog: FC<ScreenshotPreviewDialogProps> = ({
  open,
  onOpenChange,
  imageUrl,
  alt = 'Попередній перегляд скріншоту',
  canNavigate = false,
  onPrevious,
  onNext,
  footer,
}) => {
  useEffect(() => {
    if (!open || !canNavigate) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onPrevious?.();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        onNext?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, canNavigate, onPrevious, onNext]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className={previewDialogClassName}>
        {imageUrl ? (
          <div className="relative min-h-0 min-w-0 flex-1">
            <img src={imageUrl} alt={alt} className="size-full object-contain" />
            {canNavigate && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  onClick={onPrevious}>
                  <ChevronLeftIcon className="size-5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={onNext}>
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
