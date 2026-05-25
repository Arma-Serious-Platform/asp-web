'use client';

import { ComponentPropsWithoutRef, ForwardedRef, Ref, forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { FixedCropper, FixedCropperRef } from 'react-advanced-cropper';

import { Button } from '@/shared/ui/atoms/button';
import { cn } from '@/shared/utils/cn';

type CropperWithZoomProps = ComponentPropsWithoutRef<typeof FixedCropper> & {
  controlsClassName?: string;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
};

type ZoomableCropperRef = FixedCropperRef & {
  zoomImage?: (factor: number) => void;
};

const setForwardedRef = (ref: ForwardedRef<FixedCropperRef>, value: FixedCropperRef | null) => {
  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  if (ref) {
    ref.current = value;
  }
};

export const CropperWithZoom = forwardRef<FixedCropperRef, CropperWithZoomProps>(
  (
    {
      className,
      controlsClassName,
      src,
      minZoom = 0.5,
      maxZoom = 3,
      zoomStep = 0.1,
      ...props
    },
    forwardedRef,
  ) => {
    const cropperRef = useRef<FixedCropperRef | null>(null);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
      setZoom(1);
    }, [src]);

    const setCropperRef = useCallback(
      (value: FixedCropperRef | null) => {
        cropperRef.current = value;
        setForwardedRef(forwardedRef, value);
      },
      [forwardedRef],
    );

    const updateZoom = useCallback(
      (nextZoom: number) => {
        const resolvedZoom = Math.min(maxZoom, Math.max(minZoom, nextZoom));
        const factor = resolvedZoom / zoom;
        const cropper = cropperRef.current as ZoomableCropperRef | null;

        cropper?.zoomImage?.(factor);
        setZoom(resolvedZoom);
      },
      [maxZoom, minZoom, zoom],
    );

    return (
      <div className="flex flex-col gap-3">
        <FixedCropper ref={setCropperRef as Ref<FixedCropperRef>} className={className} src={src} {...props} />

        <div className={cn('flex items-center gap-3 rounded-lg border border-white/10 bg-black/30 p-2', controlsClassName)}>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="size-9 p-0"
            disabled={zoom <= minZoom}
            onClick={() => updateZoom(zoom - zoomStep)}
            aria-label="Зменшити масштаб">
            <MinusIcon className="size-4" />
          </Button>

          <input
            type="range"
            min={minZoom}
            max={maxZoom}
            step={zoomStep}
            value={zoom}
            onChange={event => updateZoom(Number(event.target.value))}
            className="h-2 min-w-0 flex-1 cursor-pointer accent-lime-600"
            aria-label="Масштаб зображення"
          />

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="size-9 p-0"
            disabled={zoom >= maxZoom}
            onClick={() => updateZoom(zoom + zoomStep)}
            aria-label="Збільшити масштаб">
            <PlusIcon className="size-4" />
          </Button>

          <span className="w-12 text-right text-xs tabular-nums text-zinc-400">{Math.round(zoom * 100)}%</span>
        </div>
      </div>
    );
  },
);

CropperWithZoom.displayName = 'CropperWithZoom';
