'use client';

import { observer } from 'mobx-react-lite';
import {
  CropperRef,
  FixedCropper,
  ImageRestriction,
  FixedCropperRef,
} from 'react-advanced-cropper';

import 'react-advanced-cropper/dist/style.css';

import { ChangeAvatarModel } from './model';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogOverlay,
} from '@/shared/ui/organisms/dialog';
import { Button } from '@/shared/ui/atoms/button';
import { RefObject, useEffect, useRef, useState } from 'react';
import { base64ToFile } from '@/shared/utils/file';
import { Preloader } from '@/shared/ui/atoms/preloader';

type ChangeAvatarModalProps = {
  model: ChangeAvatarModel;
};

const ChangeAvatarModal = observer(({ model }: ChangeAvatarModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<CropperRef>(null);
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState('');

  useEffect(() => {
    if (file) {
      setImage(URL.createObjectURL(file));
    } else {
      setImage('');
    }
  }, [file]);

  return (
    <Dialog open={model.modal.isOpen} onOpenChange={model.modal.switch}>
      <DialogOverlay />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-lg font-bold'>
            Змінити аватар
          </DialogTitle>
        </DialogHeader>
        <div className='overflow-hidden'>
          <Preloader isLoading={model.loader.isLoading}>
            <div className='flex flex-col gap-2'>
              <input
                ref={inputRef}
                className='hidden'
                type='file'
                disabled={model.loader.isLoading}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />

              <Button
                variant={file ? 'outline' : 'default'}
                disabled={model.loader.isLoading}
                onClick={() => inputRef.current?.click()}>
                {file ? 'Змінити файл' : 'Обрати файл'}
              </Button>

              {image && (
                <FixedCropper
                  ref={cropperRef as RefObject<FixedCropperRef>}
                  className='h-64'
                  src={image}
                  stencilProps={{
                    handlers: false,
                    lines: true,
                    movable: false,
                    resizable: false,
                  }}
                  imageRestriction={ImageRestriction.stencil}
                  stencilSize={{
                    height: 256,
                    width: 256,
                  }}
                />
              )}

              {image && (
                <Button
                  disabled={model.loader.isLoading}
                  onClick={async () => {
                    const base64 = cropperRef.current?.getCanvas()?.toDataURL();

                    if (!base64) return;

                    const file = await base64ToFile(base64, 'avatar');

                    model.changeAvatar(file);
                  }}>
                  Зберегти
                </Button>
              )}
            </div>
          </Preloader>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export { ChangeAvatarModal };
