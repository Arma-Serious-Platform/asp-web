'use client';

import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { FixedCropperRef, ImageRestriction } from 'react-advanced-cropper';
import { LoaderIcon, UploadIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { ManageSpecializationState } from '../state/manage-specializations.state';
import { Specialization } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from '@/shared/ui/organisms/dialog';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/ui/organisms/drawer';
import { CropperWithZoom } from '@/shared/ui/organisms/cropper-with-zoom';
import { base64ToFile, ensureValidUploadFile, resolveUploadFileFromInput } from '@/shared/utils/file';

type ManageSpecializationModalProps = {
  state: ManageSpecializationState;
  onCreateSuccess?: (specialization: Specialization) => void;
  onUpdateSuccess?: (specialization: Specialization) => void;
  onDeleteSuccess?: (specialization: Specialization) => void;
};

export const ManageSpecializationModal: FC<ManageSpecializationModalProps> = observer(
  ({ state, onCreateSuccess, onUpdateSuccess, onDeleteSuccess }) => {
    const iconInputRef = useRef<HTMLInputElement>(null);
    const cropperRef = useRef<FixedCropperRef>(null);
    const specialization = state.modal.payload?.specialization;
    const isEdit = Boolean(specialization?.id);

    const [name, setName] = useState('');
    const [color, setColor] = useState('#84cc16');
    const [icon, setIcon] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState('');
    const [iconToCrop, setIconToCrop] = useState<File | null>(null);
    const [iconToCropPreview, setIconToCropPreview] = useState('');

    const isCropping = Boolean(iconToCropPreview);

    useEffect(() => {
      if (state.modal.isOpen && state.modal.payload?.mode === 'manage') {
        setName(specialization?.name ?? '');
        setColor(specialization?.color || '#84cc16');
        setIcon(null);
        setIconPreview('');
        setIconToCrop(null);
        setIconToCropPreview('');
      }

      if (!state.modal.isOpen) {
        setName('');
        setColor('#84cc16');
        setIcon(null);
        setIconPreview('');
        setIconToCrop(null);
        setIconToCropPreview('');
      }
    }, [state.modal.isOpen, state.modal.payload?.mode, specialization]);

    useEffect(() => {
      if (!icon) {
        setIconPreview('');
        return;
      }

      const url = URL.createObjectURL(icon);
      setIconPreview(url);

      return () => URL.revokeObjectURL(url);
    }, [icon]);

    useEffect(() => {
      if (!iconToCrop) {
        setIconToCropPreview('');
        return;
      }

      const url = URL.createObjectURL(iconToCrop);
      setIconToCropPreview(url);

      return () => URL.revokeObjectURL(url);
    }, [iconToCrop]);

    const handleIconChange = (event: ChangeEvent<HTMLInputElement>) => {
      const file = resolveUploadFileFromInput(event.target.files?.[0], event.currentTarget);

      if (!file) return;

      setIconToCrop(file);
    };

    const handleSaveCroppedIcon = async () => {
      const base64 = cropperRef.current?.getCanvas()?.toDataURL();

      if (!base64) return;

      const file = await base64ToFile(base64, 'specialization-icon');

      if (!ensureValidUploadFile(file)) return;

      setIcon(file);
      setIconToCrop(null);
    };

    const handleCancelCrop = () => {
      setIconToCrop(null);
      if (iconInputRef.current) {
        iconInputRef.current.value = '';
      }
    };

    const handleSubmit = async () => {
      const trimmedName = name.trim();
      if (!trimmedName) return;

      if (isEdit && specialization?.id) {
        const dto = {
          id: specialization.id,
          ...(trimmedName !== specialization.name && { name: trimmedName }),
          ...(color !== (specialization.color || '#84cc16') && { color }),
          ...(icon && { icon }),
        };

        await state.updateSpecialization(dto, onUpdateSuccess);
        return;
      }

      await state.createSpecialization({ name: trimmedName, color, icon: icon || undefined }, onCreateSuccess);
    };

    const iconSrc = iconPreview || specialization?.icon?.url || '';

    return (
      <>
        <Drawer
          open={state.modal.isOpen && state.modal.payload?.mode === 'manage'}
          onOpenChange={state.modal.switch}>
          <DrawerContent>
            <div className="flex min-h-0 flex-1 flex-col gap-4">
              <DrawerHeader>
                <DrawerTitle>{isEdit ? 'Редагувати спеціалізацію' : 'Нова спеціалізація'}</DrawerTitle>
              </DrawerHeader>

              <DrawerBody>
                <div className="flex flex-col items-center gap-2">
                  <input
                    ref={iconInputRef}
                    className="hidden"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                    disabled={state.loader.isLoading}
                    onChange={handleIconChange}
                  />

                  {isCropping ? (
                    <div className="flex w-full flex-col gap-3">
                      <CropperWithZoom
                        ref={cropperRef}
                        className="h-64 rounded-sm"
                        src={iconToCropPreview}
                        imageRestriction={ImageRestriction.stencil}
                        stencilProps={{
                          handlers: false,
                          lines: true,
                          movable: false,
                          resizable: false,
                        }}
                        stencilSize={{
                          height: 256,
                          width: 256,
                        }}
                      />
                      <div className="flex justify-between gap-2">
                        <Button type="button" variant="outline" onClick={handleCancelCrop}>
                          Скасувати
                        </Button>
                        <Button type="button" onClick={handleSaveCroppedIcon}>
                          Застосувати
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex size-24 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/70">
                        {iconSrc ? (
                          <Image
                            src={iconSrc}
                            alt={name || 'Іконка спеціалізації'}
                            width={96}
                            height={96}
                            className="size-24 object-cover"
                            unoptimized={!iconSrc.startsWith('https')}
                          />
                        ) : (
                          <span className="text-xs text-zinc-500">Без іконки</span>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={state.loader.isLoading}
                        onClick={() => iconInputRef.current?.click()}>
                        <UploadIcon className="size-4" />
                        {iconSrc ? 'Змінити іконку' : 'Обрати іконку'}
                      </Button>
                    </>
                  )}
                </div>

                {!isCropping && (
                  <>
                    <Input
                      autoFocus
                      label="Назва"
                      value={name}
                      disabled={state.loader.isLoading}
                      onChange={event => setName(event.target.value)}
                    />

                    <div className="grid grid-cols-[3rem_1fr] items-center gap-3">
                      <input
                        type="color"
                        value={color}
                        disabled={state.loader.isLoading}
                        onChange={event => setColor(event.target.value)}
                        className="h-9 w-12 cursor-pointer rounded-md border border-neutral-700 bg-black/70 p-1 disabled:cursor-not-allowed disabled:opacity-45"
                      />
                      <Input
                        label="Колір"
                        value={color}
                        disabled={state.loader.isLoading}
                        onChange={event => setColor(event.target.value)}
                      />
                    </div>
                  </>
                )}
              </DrawerBody>

              {!isCropping && (
                <DrawerFooter className="border-t border-white/10 pt-4 sm:flex-row sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={state.loader.isLoading}
                    onClick={() => state.modal.close()}>
                    Скасувати
                  </Button>
                  <Button type="button" disabled={state.loader.isLoading || !name.trim()} onClick={handleSubmit}>
                    {state.loader.isLoading && <LoaderIcon className="size-4 animate-spin" />}
                    {isEdit ? 'Зберегти' : 'Створити'}
                  </Button>
                </DrawerFooter>
              )}
            </div>
          </DrawerContent>
        </Drawer>

        <Dialog
          open={state.modal.isOpen && state.modal.payload?.mode === 'delete'}
          onOpenChange={state.modal.switch}>
          <DialogOverlay />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Видалити спеціалізацію <span className="text-lime-400">{specialization?.name}</span>?
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 flex justify-between">
              <Button variant="outline" disabled={state.loader.isLoading} onClick={() => state.modal.close()}>
                Скасувати
              </Button>
              <Button
                variant="destructive"
                disabled={state.loader.isLoading}
                onClick={() => {
                  if (specialization?.id) void state.deleteSpecialization(specialization.id, onDeleteSuccess);
                }}>
                Видалити
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);
