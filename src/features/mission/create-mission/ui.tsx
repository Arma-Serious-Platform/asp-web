'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { Textarea } from '@/shared/ui/atoms/textarea';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from '@/shared/ui/organisms/dialog';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect, useRef, FC, RefObject, useState } from 'react';
import { LoaderIcon, UploadIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { CropperRef, FixedCropper, ImageRestriction, FixedCropperRef } from 'react-advanced-cropper';
import { base64ToFile } from '@/shared/utils/file';
import { CreateMissionModel, MissionFormData } from './model';
import { Select } from '@/shared/ui/atoms/select';
import { api } from '@/shared/sdk';
import { Island } from '@/shared/sdk/types';
import { Section } from '@/shared/ui/organisms/section';

const missionSchema = yup.object().shape({
  name: yup.string().required("Назва є обов'язковою"),
  description: yup.string().required("Опис є обов'язковим"),
  islandId: yup.string().required("Карта є обов'язковою"),
});

const CreateMissionModal: FC<{
  model: CreateMissionModel;
  onSuccess?: (missionId: string) => void;
}> = observer(({ model, onSuccess }) => {
  const imageRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<CropperRef>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [islands, setIslands] = useState<Island[]>([]);
  const [isLoadingIslands, setIsLoadingIslands] = useState(false);

  const islandsOptions = islands.map(island => ({
    value: island.id,
    label: island.name,
  }));

  const missionForm = useForm<MissionFormData>({
    mode: 'onChange',
    resolver: yupResolver(missionSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      islandId: '',
      image: null,
    },
  });

  useEffect(() => {
    if (model.visibility.isOpen) {
      const loadIslands = async () => {
        try {
          setIsLoadingIslands(true);
          const response = await api.findIslands();
          setIslands(response.data);
        } catch (error) {
          console.error('Failed to load islands:', error);
        } finally {
          setIsLoadingIslands(false);
        }
      };

      loadIslands();
      missionForm.reset({
        name: '',
        description: '',
        islandId: '',
        image: null,
      });
      setImagePreview('');
    }
  }, [model.visibility.isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      missionForm.setValue('image', null);
    }
  };

  const handleSubmit = async (data: MissionFormData) => {
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
    missionForm.reset({
      name: '',
      description: '',
      islandId: '',
      image: null,
    });
  };

  return (
    <Dialog open={model.visibility.isOpen} onOpenChange={model.visibility.switch}>
      <DialogOverlay />
      <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Створити місію</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={missionForm.handleSubmit(handleSubmit)}>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-4">
              <input
                ref={imageRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                onChange={handleImageChange}
                className="hidden"
              />
              {imagePreview && (
                <FixedCropper
                  ref={cropperRef as RefObject<FixedCropperRef>}
                  className="h-64 rounded-lg"
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
                    width: 512,
                  }}
                  stencilSize={{
                    height: 256,
                    width: 512,
                  }}
                />
              )}
              {!imagePreview && (
                <div className="relative w-full aspect-video overflow-hidden rounded-lg border border-white/10 bg-black/80 flex items-center justify-center">
                  <span className="text-zinc-500 text-sm">Рекомендовано 512x256</span>
                </div>
              )}
              <Button
                type="button"
                variant={imagePreview ? 'outline' : 'default'}
                className="w-full"
                onClick={() => {
                  imageRef.current?.click();
                  setImagePreview('');
                }}>
                <UploadIcon className="size-4" />
                {imagePreview ? 'Обрати інше зображення' : 'Обрати зображення'}
              </Button>
            </div>

            <Controller
              control={missionForm.control}
              name="name"
              render={({ field }) => (
                <Input {...field} label="Назва місії" autoFocus error={missionForm.formState.errors.name?.message} />
              )}
            />

            <Controller
              control={missionForm.control}
              name="islandId"
              render={({ field }) => (
                <Select
                  label="Карта"
                  options={islandsOptions}
                  value={field.value || null}
                  onChange={field.onChange}
                  isLoading={isLoadingIslands}
                  error={missionForm.formState.errors.islandId?.message}
                />
              )}
            />

            <Controller
              control={missionForm.control}
              name="description"
              render={({ field }) => (
                <Textarea
                  {...field}
                  label="Опис місії"
                  rows={6}
                  placeholder="Опишіть місію..."
                  error={missionForm.formState.errors.description?.message}
                />
              )}
            />

            <Section className="text-center p-2 text-sm text-muted">
              Після створення місії ви зможете додати її першу версію
            </Section>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Скасувати
            </Button>
            <Button type="submit" disabled={model.loader.isLoading || !missionForm.formState.isValid}>
              {model.loader.isLoading ? (
                <>
                  <LoaderIcon className="size-4 animate-spin" />
                  Створення...
                </>
              ) : (
                'Створити місію'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

export { CreateMissionModal };
