'use client';

import { FC, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { FixedCropperRef, ImageRestriction } from 'react-advanced-cropper';
import { CropIcon, UploadIcon } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/shared/ui/atoms/button';
import { CropperWithZoom } from '@/shared/ui/organisms/cropper-with-zoom';
import { base64ToFile, ensureValidUploadFile, resolveUploadFileFromInput } from '@/shared/utils/file';
import { cn } from '@/shared/utils/cn';

const STENCIL = { width: 512, height: 256 } as const;

type MissionImageFieldProps = {
  /** Object URL of the newly cropped image (preferred over existingUrl). */
  previewUrl?: string | null;
  /** Existing mission image URL (update flow). */
  existingUrl?: string | null;
  onCropped: (file: File, previewUrl: string) => void;
  className?: string;
};

export const MissionImageField: FC<MissionImageFieldProps> = ({
  previewUrl,
  existingUrl,
  onCropped,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<FixedCropperRef>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [ownedCropSrc, setOwnedCropSrc] = useState(false);
  const [isRecropLoading, setIsRecropLoading] = useState(false);

  const displayUrl = previewUrl || existingUrl || null;

  useEffect(() => {
    return () => {
      if (ownedCropSrc && cropSrc) {
        URL.revokeObjectURL(cropSrc);
      }
    };
  }, [cropSrc, ownedCropSrc]);

  const clearCropSession = () => {
    if (ownedCropSrc && cropSrc) {
      URL.revokeObjectURL(cropSrc);
    }
    setCropSrc(null);
    setOwnedCropSrc(false);
    setIsCropping(false);
  };

  const startCropFromSrc = (src: string, revokeOnClear: boolean) => {
    if (ownedCropSrc && cropSrc) {
      URL.revokeObjectURL(cropSrc);
    }
    setCropSrc(src);
    setOwnedCropSrc(revokeOnClear);
    setIsCropping(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = resolveUploadFileFromInput(event.target.files?.[0], event.currentTarget);
    if (!file) return;
    startCropFromSrc(URL.createObjectURL(file), true);
  };

  const handleRecropExisting = async () => {
    if (!existingUrl) return;

    setIsRecropLoading(true);
    try {
      startCropFromSrc(existingUrl, false);
    } catch {
      toast.error('Не вдалося завантажити зображення для обрізання');
    } finally {
      setIsRecropLoading(false);
    }
  };

  const handleApplyCrop = async () => {
    try {
      const canvas = cropperRef.current?.getCanvas();
      const base64 = canvas?.toDataURL();
      if (!base64) {
        toast.error('Не вдалося обрізати зображення');
        return;
      }

      const imageFile = await base64ToFile(base64, 'mission-image');
      if (!ensureValidUploadFile(imageFile)) return;

      const nextPreview = URL.createObjectURL(imageFile);
      onCropped(imageFile, nextPreview);
      clearCropSession();
    } catch {
      toast.error('Не вдалося обрізати зображення. Перевірте доступ до файлу (CORS).');
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {isCropping && cropSrc ? (
        <div className="flex flex-col gap-2">
          <div className="w-full overflow-hidden rounded-lg border border-white/10">
            <CropperWithZoom
              ref={cropperRef}
              className="aspect-[2/1] h-auto max-w-full rounded-lg"
              src={cropSrc}
              imageRestriction={ImageRestriction.stencil}
              stencilProps={{
                handlers: false,
                lines: true,
                movable: false,
                resizable: false,
              }}
              stencilSize={STENCIL}
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={clearCropSession}>
              Скасувати
            </Button>
            <Button type="button" className="flex-1" onClick={handleApplyCrop}>
              Застосувати
            </Button>
          </div>
        </div>
      ) : (
        <>
          {displayUrl ? (
            <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg border border-white/10 bg-black/80">
              {previewUrl ? (
                // Object URL from crop
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayUrl} alt="Зображення місії" className="size-full object-contain" />
              ) : (
                <Image
                  src={displayUrl}
                  alt="Зображення місії"
                  fill
                  className="object-contain"
                  unoptimized={!displayUrl.startsWith('https')}
                />
              )}
            </div>
          ) : (
            <div className="relative flex aspect-[2/1] w-full items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/80">
              <span className="text-sm text-zinc-500">Рекомендовано 512×256</span>
            </div>
          )}

          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant={displayUrl ? 'outline' : 'default'}
              className="w-full"
              onClick={() => inputRef.current?.click()}>
              <UploadIcon className="size-4" />
              {displayUrl ? 'Обрати інше зображення' : 'Обрати зображення'}
            </Button>
            {existingUrl && !previewUrl && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isRecropLoading}
                onClick={handleRecropExisting}>
                <CropIcon className="size-4" />
                Обрізати
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
