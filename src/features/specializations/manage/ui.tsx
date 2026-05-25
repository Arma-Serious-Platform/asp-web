'use client';

import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { FixedCropperRef, ImageRestriction } from 'react-advanced-cropper';
import { LoaderIcon, UploadIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { ManageSpecializationModel } from './model';
import { Specialization } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from '@/shared/ui/organisms/dialog';
import { CropperWithZoom } from '@/shared/ui/organisms/cropper-with-zoom';
import { base64ToFile, ensureValidUploadFile, resolveUploadFileFromInput } from '@/shared/utils/file';

type ManageSpecializationModalProps = {
  model: ManageSpecializationModel;
  onCreateSuccess?: (specialization: Specialization) => void;
  onUpdateSuccess?: (specialization: Specialization) => void;
  onDeleteSuccess?: (specialization: Specialization) => void;
};

export const ManageSpecializationModal: FC<ManageSpecializationModalProps> = observer(
  ({ model, onCreateSuccess, onUpdateSuccess, onDeleteSuccess }) => {
    const iconInputRef = useRef<HTMLInputElement>(null);
    const cropperRef = useRef<FixedCropperRef>(null);
    const specialization = model.modal.payload?.specialization;
    const isEdit = Boolean(specialization?.id);

    const [name, setName] = useState('');
    const [color, setColor] = useState('#84cc16');
    const [icon, setIcon] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState('');
    const [iconToCrop, setIconToCrop] = useState<File | null>(null);
    const [iconToCropPreview, setIconToCropPreview] = useState('');
    const [cropperOpen, setCropperOpen] = useState(false);

    useEffect(() => {
      if (model.modal.isOpen && model.modal.payload?.mode === 'manage') {
        setName(specialization?.name ?? '');
        setColor(specialization?.color || '#84cc16');
        setIcon(null);
        setIconPreview('');
        setIconToCrop(null);
        setIconToCropPreview('');
        setCropperOpen(false);
      }

      if (!model.modal.isOpen) {
        setName('');
        setColor('#84cc16');
        setIcon(null);
        setIconPreview('');
        setIconToCrop(null);
        setIconToCropPreview('');
        setCropperOpen(false);
      }
    }, [model.modal.isOpen, model.modal.payload?.mode, specialization]);

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
      setCropperOpen(true);
    };

    const handleSaveCroppedIcon = async () => {
      const base64 = cropperRef.current?.getCanvas()?.toDataURL();

      if (!base64) return;

      const file = await base64ToFile(base64, 'specialization-icon');

      if (!ensureValidUploadFile(file)) return;

      setIcon(file);
      setCropperOpen(false);
      setIconToCrop(null);
    };

    const handleCloseCropper = (open: boolean) => {
      setCropperOpen(open);

      if (!open) {
        setIconToCrop(null);
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

        await model.updateSpecialization(dto, onUpdateSuccess);
        return;
      }

      await model.createSpecialization({ name: trimmedName, color, icon: icon || undefined }, onCreateSuccess);
    };

    const iconSrc = iconPreview || specialization?.icon?.url || '';

    return (
      <>
        <Dialog open={cropperOpen} onOpenChange={handleCloseCropper}>
          <DialogOverlay />
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Обрізати іконку спеціалізації</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3 overflow-hidden">
              {iconToCropPreview && (
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
              )}

              <div className="flex justify-between gap-2">
                <Button type="button" variant="outline" onClick={() => handleCloseCropper(false)}>
                  Скасувати
                </Button>
                <Button type="button" onClick={handleSaveCroppedIcon} disabled={!iconToCropPreview}>
                  Застосувати
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={model.modal.isOpen && model.modal.payload?.mode === 'manage'}
          onOpenChange={model.modal.switch}>
          <DialogOverlay />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEdit ? 'Редагувати спеціалізацію' : 'Нова спеціалізація'}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center gap-2">
                <input
                  ref={iconInputRef}
                  className="hidden"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                  disabled={model.loader.isLoading}
                  onChange={handleIconChange}
                />
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
                  disabled={model.loader.isLoading}
                  onClick={() => iconInputRef.current?.click()}>
                  <UploadIcon className="size-4" />
                  {iconSrc ? 'Змінити іконку' : 'Обрати іконку'}
                </Button>
              </div>

              <Input
                autoFocus
                label="Назва"
                value={name}
                disabled={model.loader.isLoading}
                onChange={event => setName(event.target.value)}
              />

              <div className="grid grid-cols-[3rem_1fr] items-center gap-3">
                <input
                  type="color"
                  value={color}
                  disabled={model.loader.isLoading}
                  onChange={event => setColor(event.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-md border border-neutral-700 bg-black/70 p-1 disabled:cursor-not-allowed disabled:opacity-45"
                />
                <Input
                  label="Колір"
                  value={color}
                  disabled={model.loader.isLoading}
                  onChange={event => setColor(event.target.value)}
                />
              </div>

              <div className="mt-2 flex justify-between gap-2">
                <Button type="button" variant="outline" disabled={model.loader.isLoading} onClick={() => model.modal.close()}>
                  Скасувати
                </Button>
                <Button type="button" disabled={model.loader.isLoading || !name.trim()} onClick={handleSubmit}>
                  {model.loader.isLoading && <LoaderIcon className="size-4 animate-spin" />}
                  {isEdit ? 'Зберегти' : 'Створити'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={model.modal.isOpen && model.modal.payload?.mode === 'delete'}
          onOpenChange={model.modal.switch}>
          <DialogOverlay />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Видалити спеціалізацію <span className="text-lime-400">{specialization?.name}</span>?
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 flex justify-between">
              <Button variant="outline" disabled={model.loader.isLoading} onClick={() => model.modal.close()}>
                Скасувати
              </Button>
              <Button
                variant="destructive"
                disabled={model.loader.isLoading}
                onClick={() => {
                  if (specialization?.id) void model.deleteSpecialization(specialization.id, onDeleteSuccess);
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
