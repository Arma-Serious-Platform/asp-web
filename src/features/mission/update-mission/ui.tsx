'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
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
import { useEffect, useMemo, useRef, FC, PropsWithChildren, useState } from 'react';
import { LoaderIcon, UploadIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { FixedCropperRef, ImageRestriction } from 'react-advanced-cropper';
import { base64ToFile, ensureValidUploadFile, resolveUploadFileFromInput } from '@/shared/utils/file';
import { UpdateMissionModel, MissionFormData } from './model';
import { Select } from '@/shared/ui/atoms/select';
import { api } from '@/shared/sdk';
import { Island, MissionType, User } from '@/shared/sdk/types';
import { missionTypeLabels } from '@/entities/mission/lib';
import { mapUsersToSelectOptions } from '@/entities/user/ui/user-select-options';
import { session } from '@/entities/session/model';
import { CropperWithZoom } from '@/shared/ui/organisms/cropper-with-zoom';
import { MessageEditor } from '@/features/chat/editor';
import { getMessageText } from '@/entities/comment/lexical-message';

const missionSchema = yup.object().shape({
  name: yup.string().required("Назва є обов'язковою"),
  description: yup
    .mixed()
    .test('required-description', "Опис є обов'язковим", value => Boolean(value && getMessageText(value as any).trim())),
  islandId: yup.string().required("Карта є обов'язковою"),
  missionType: yup
    .mixed<MissionType>()
    .oneOf(Object.values(MissionType) as MissionType[])
    .required("Тип місії є обов'язковим"),
  coauthorIds: yup.array(yup.string().required()).default([]),
});

const UpdateMissionModal: FC<
  PropsWithChildren<{
    model: UpdateMissionModel;
    onSuccess?: () => void;
  }>
> = observer(({ model, children, onSuccess }) => {
  const imageRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<FixedCropperRef>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<File | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string>('');
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
  const [islands, setIslands] = useState<Island[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingIslands, setIsLoadingIslands] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const payload = model.visibility?.payload;
  const mission = payload?.mission;
  const currentUserId = session.user?.user?.id;
  const isCurrentUserCoauthor = Boolean(
    currentUserId && mission?.coauthors?.some(coauthor => coauthor.id === currentUserId),
  );
  const canUpdateCoauthors = !isCurrentUserCoauthor;

  const islandsOptions = islands.map(island => ({
    value: island.id,
    label: island.name,
  }));
  const coauthorOptions = useMemo(() => {
    const usersById = new Map<string, User>();

    [...users, ...(mission?.coauthors ?? [])].forEach(user => {
      usersById.set(user.id, user);
    });

    return mapUsersToSelectOptions([...usersById.values()].filter(user => user.id !== mission?.authorId));
  }, [users, mission]);

  const missionForm = useForm<MissionFormData>({
    mode: 'onChange',
    resolver: yupResolver(missionSchema) as any,
    defaultValues: {
      name: '',
      description: null,
      islandId: '',
      missionType: MissionType.SG,
      image: null,
      coauthorIds: [],
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
      const loadUsers = async () => {
        try {
          setIsLoadingUsers(true);
          const response = await api.findUsers({ take: 1000, skip: 0 });
          setUsers(response.data.data);
        } catch (error) {
          console.error('Failed to load users:', error);
        } finally {
          setIsLoadingUsers(false);
        }
      };

      loadIslands();
      loadUsers();

      if (mission) {
        missionForm.reset({
          name: mission.name,
          description: mission.description,
          islandId: mission?.island?.id || '',
          missionType: mission.missionType || MissionType.SG,
          image: null,
          coauthorIds: mission.coauthors?.map(coauthor => coauthor.id) ?? [],
        });
        setCroppedPreview('');
        setCroppedImageFile(null);
        setImageToCrop(null);
        setCropperOpen(false);
      }
    }
  }, [model.visibility.isOpen, mission]);

  const imageToCropPreview = imageToCrop ? URL.createObjectURL(imageToCrop) : '';

  useEffect(() => {
    if (!imageToCropPreview) return;
    return () => URL.revokeObjectURL(imageToCropPreview);
  }, [imageToCropPreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = resolveUploadFileFromInput(e.target.files?.[0], e.currentTarget);
    if (file) {
      setImageToCrop(file);
      setCropperOpen(true);
    }
  };

  const handleSaveCroppedImage = async () => {
    const base64 = cropperRef.current?.getCanvas()?.toDataURL();
    if (!base64) return;

    const imageFile = await base64ToFile(base64, 'mission-image');
    if (!ensureValidUploadFile(imageFile)) return;

    setCroppedImageFile(imageFile);
    setCroppedPreview(URL.createObjectURL(imageFile));
    setCropperOpen(false);
    setImageToCrop(null);
    missionForm.setValue('image', null);
  };

  const handleCloseCropper = (open: boolean) => {
    setCropperOpen(open);
    if (!open) {
      setImageToCrop(null);
    }
  };

  const handleSubmit = async (data: MissionFormData) => {
    if (!mission) return;

    try {
      let imageFile: File | null = croppedImageFile;

      if (!imageFile && data.image) {
        imageFile = data.image;
      }

      await model.save(data, imageFile, canUpdateCoauthors, onSuccess);
      setCroppedPreview('');
      setCroppedImageFile(null);
    } catch (error) {
      // Error is handled in the model
    }
  };

  const handleClose = () => {
    model.visibility.close();
    setCroppedPreview('');
    setCroppedImageFile(null);
    setImageToCrop(null);
    setCropperOpen(false);
    if (mission) {
      missionForm.reset({
        name: mission.name,
        description: mission.description,
        islandId: mission?.island?.id || '',
        missionType: mission.missionType || MissionType.SG,
        image: null,
        coauthorIds: mission.coauthors?.map(coauthor => coauthor.id) ?? [],
      });
    }
  };

  if (!mission) return null;

  return (
    <>
      <Dialog open={cropperOpen} onOpenChange={handleCloseCropper}>
        <DialogOverlay />
        <DialogContent className="w-[min(calc(100vw-2rem),48rem)] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Обрізати зображення місії</DialogTitle>
          </DialogHeader>
          <div className="flex max-h-[calc(90vh-8rem)] flex-col gap-3 overflow-hidden">
            {imageToCropPreview && (
              <div className="min-h-0 overflow-hidden">
                <CropperWithZoom
                  ref={cropperRef}
                  className="h-64 max-w-full rounded-lg"
                  src={imageToCropPreview}
                  imageRestriction={ImageRestriction.stencil}
                  stencilProps={{
                    handlers: false,
                    lines: true,
                    movable: false,
                    resizable: false,
                  }}
                  stencilSize={{
                    height: 256,
                    width: 455,
                  }}
                />
              </div>
            )}
            <div className="flex justify-between gap-2">
              <Button type="button" variant="outline" onClick={() => handleCloseCropper(false)}>
                Скасувати
              </Button>
              <Button type="button" onClick={handleSaveCroppedImage} disabled={!imageToCropPreview}>
                Застосувати
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={model.visibility.isOpen} onOpenChange={model.visibility.switch}>
      <DialogOverlay />
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="w-[min(calc(100vw-2rem),64rem)] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Редагувати місію</DialogTitle>
        </DialogHeader>
        <form className="flex min-h-0 flex-col gap-4" onSubmit={missionForm.handleSubmit(handleSubmit)}>
          <div className="flex max-h-[calc(90vh-9rem)] flex-col gap-4 overflow-y-auto pr-2">
            <input
              ref={imageRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
              onChange={handleImageChange}
              className="hidden"
            />
            {croppedPreview ? (
              <div className="relative aspect-2/1 w-full max-w-full overflow-hidden rounded-lg border border-white/10 bg-black/80">
                <img src={croppedPreview} alt="Нове зображення місії" className="size-full object-contain" />
              </div>
            ) : mission.image?.url ? (
              <div className="relative aspect-2/1 w-full max-w-full overflow-hidden rounded-lg border border-white/10 bg-black/80">
                <Image
                  src={mission.image.url}
                  alt="Current image"
                  fill
                  className="object-contain"
                  unoptimized={!mission.image.url.startsWith('https')}
                />
              </div>
            ) : (
              <div className="relative flex aspect-2/1 w-full items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/80">
                <span className="text-zinc-500 text-sm">Немає зображення</span>
              </div>
            )}
            <Button
              type="button"
              variant={croppedPreview || mission.image?.url ? 'outline' : 'default'}
              className="w-full"
              onClick={() => imageRef.current?.click()}>
              <UploadIcon className="size-4" />
              {croppedPreview || mission.image?.url ? 'Обрати інше зображення' : 'Обрати зображення'}
            </Button>

            <Controller
              control={missionForm.control}
              name="name"
              render={({ field }) => (
                <Input {...field} label="Назва місії" error={missionForm.formState.errors.name?.message} />
              )}
            />

            <Controller
              control={missionForm.control}
              name="islandId"
              render={({ field }) => (
                <Select
                  label="Карта"
                  localSearch
                  resultsClassName="max-h-[150px] overflow-y-auto"
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
              name="missionType"
              render={({ field }) => (
                <Select
                  label="Тип місії"
                  options={[
                    { value: MissionType.SG, label: missionTypeLabels[MissionType.SG] },
                    { value: MissionType.mini, label: missionTypeLabels[MissionType.mini] },
                  ]}
                  value={field.value || null}
                  onChange={field.onChange}
                  error={missionForm.formState.errors.missionType?.message as string | undefined}
                />
              )}
            />

            <Controller
              control={missionForm.control}
              name="coauthorIds"
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <Select
                    multiple
                    label="Співавтори"
                    localSearch
                  resultsClassName="max-h-[150px] overflow-y-auto"
                    placeholder="Без співавторів"
                    options={coauthorOptions}
                    value={field.value || []}
                    onChange={field.onChange}
                    isLoading={isLoadingUsers}
                    disabled={!canUpdateCoauthors}
                  />
                  {!canUpdateCoauthors && (
                    <p className="text-xs text-zinc-500">Співавтор не може змінювати список співавторів місії.</p>
                  )}
                </div>
              )}
            />

            <Controller
              control={missionForm.control}
              name="description"
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-zinc-300">Опис місії</label>
                  <MessageEditor
                    key={
                      model.visibility.isOpen
                        ? `update-mission-description-${mission.id}-${mission.updatedAt}`
                        : 'update-mission-description-closed'
                    }
                    initialState={field.value}
                    placeholder="Опишіть місію..."
                    maxCharacters={2000}
                    showSubmit={false}
                    textFormattingOnly
                    onChange={({ lexicalState }) => field.onChange(lexicalState)}
                  />
                  {missionForm.formState.errors.description?.message && (
                    <p className="text-sm text-red-400">{missionForm.formState.errors.description.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Скасувати
            </Button>
            <Button type="submit" disabled={model.loader.isLoading || !missionForm.formState.isValid}>
              {model.loader.isLoading ? (
                <>
                  <LoaderIcon className="size-4 animate-spin" />
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
    </>
  );
});

export { UpdateMissionModal };
