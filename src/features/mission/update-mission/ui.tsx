'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { Textarea } from '@/shared/ui/atoms/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/organisms/dialog';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect, useRef, FC, PropsWithChildren, RefObject, useState } from 'react';
import { LoaderIcon, UploadIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import {
  CropperRef,
  FixedCropper,
  ImageRestriction,
  FixedCropperRef,
} from 'react-advanced-cropper';
import { base64ToFile } from '@/shared/utils/file';
import { UpdateMissionModel, MissionFormData } from './model';

const missionSchema = yup.object().shape({
  name: yup.string().required("Назва є обов'язковою"),
  description: yup.string().required("Опис є обов'язковим"),
});

const UpdateMissionModal: FC<
  PropsWithChildren<{
    model: UpdateMissionModel;
    onSuccess?: () => void;
  }>
> = observer(({ model, children, onSuccess }) => {
  const imageRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<CropperRef>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const payload = model.visibility?.payload;
  const mission = payload?.mission;

  const missionForm = useForm<MissionFormData>({
    mode: 'onChange',
    resolver: yupResolver(missionSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      image: null,
    },
  });

  useEffect(() => {
    if (model.visibility.isOpen && mission) {
      missionForm.reset({
        name: mission.name,
        description: mission.description,
        image: null,
      });
      setImagePreview('');
    }
  }, [model.visibility.isOpen, mission]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      missionForm.setValue('image', null);
    }
  };

  const handleSubmit = async (data: MissionFormData) => {
    if (!mission) return;

    try {
      let imageFile: File | null = null;

      // Get cropped image if cropper is active
      if (imagePreview && cropperRef.current) {
        const base64 = cropperRef.current?.getCanvas()?.toDataURL();
        if (base64) {
          imageFile = await base64ToFile(base64, 'mission-image');
        }
      } else if (data.image) {
        imageFile = data.image;
      }

      await model.save(data, imageFile, onSuccess);
      setImagePreview('');
    } catch (error) {
      // Error is handled in the model
    }
  };

  const handleClose = () => {
    model.visibility.close();
    setImagePreview('');
    if (mission) {
      missionForm.reset({
        name: mission.name,
        description: mission.description,
        image: null,
      });
    }
  };

  if (!mission) return null;

  return (
    <Dialog open={model.visibility.isOpen} onOpenChange={model.visibility.switch}>
      <DialogOverlay />
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Редагувати місію</DialogTitle>
        </DialogHeader>
        <form
          className='flex flex-col gap-4'
          onSubmit={missionForm.handleSubmit(handleSubmit)}>
          <div className='flex flex-col gap-4'>
            <input
              ref={imageRef}
              type='file'
              accept='image/png, image/jpeg, image/jpg, image/webp, image/gif'
              onChange={handleImageChange}
              className='hidden'
            />
            {imagePreview && (
              <FixedCropper
                ref={cropperRef as RefObject<FixedCropperRef>}
                className='h-64 rounded-lg'
                src={imagePreview}
                imageRestriction={ImageRestriction.stencil}
                stencilProps={{
                  handlers: false,
                  lines: true,
                  movable: false,
                  resizable: false,
                }}
                defaultSize={{
                  height: 256,
                  width: 455,
                }}
                stencilSize={{
                  height: 256,
                  width: 455,
                }}
              />
            )}
            {!imagePreview && mission.image?.url && (
              <div className='relative w-full aspect-video overflow-hidden rounded-lg border border-white/10'>
                <Image
                  src={mission.image.url}
                  alt='Current image'
                  fill
                  className='object-cover'
                />
              </div>
            )}
            {!imagePreview && !mission.image?.url && (
              <div className='relative w-full aspect-video overflow-hidden rounded-lg border border-white/10 bg-black/80 flex items-center justify-center'>
                <span className='text-zinc-500 text-sm'>Немає зображення</span>
              </div>
            )}
            <Button
              type='button'
              variant={
                imagePreview || mission.image?.url ? 'outline' : 'default'
              }
              className='w-full'
              onClick={() => {
                imageRef.current?.click();
                setImagePreview('');
              }}>
              <UploadIcon className='size-4' />
              {imagePreview || mission.image?.url
                ? 'Обрати інше зображення'
                : 'Обрати зображення'}
            </Button>
          </div>

          <Controller
            control={missionForm.control}
            name='name'
            render={({ field }) => (
              <Input
                {...field}
                label='Назва місії'
                error={missionForm.formState.errors.name?.message}
              />
            )}
          />

          <Controller
            control={missionForm.control}
            name='description'
            render={({ field }) => (
              <Textarea
                {...field}
                label='Опис місії'
                rows={6}
                error={missionForm.formState.errors.description?.message}
              />
            )}
          />

          <div className='flex justify-between pt-4'>
            <Button type='button' variant='outline' onClick={handleClose}>
              Скасувати
            </Button>
            <Button
              type='submit'
              disabled={model.loader.isLoading || !missionForm.formState.isValid}>
              {model.loader.isLoading ? (
                <>
                  <LoaderIcon className='size-4 animate-spin' />
                  Збереження...
                </>
              ) : (
                'Зберегти зміни'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

export { UpdateMissionModal };

