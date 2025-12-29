'use client';

import { Layout } from '@/widgets/layout';
import { Card } from '@/shared/ui/atoms/card';
import { Button } from '@/shared/ui/atoms/button';
import { api } from '@/shared/sdk';
import {
  Mission,
  MissionStatus,
  MissionGameSide,
  UpdateMissionDto,
  MissionVersion,
} from '@/shared/sdk/types';
import { useEffect, useRef, useState, RefObject, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  PlusIcon,
  DownloadIcon,
  CalendarIcon,
  UsersIcon,
  LoaderIcon,
  UploadIcon,
  EditIcon,
  CheckCircleIcon,
  BanIcon,
} from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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
import { cn } from '@/shared/utils/cn';
import {
  CropperRef,
  FixedCropper,
  ImageRestriction,
  FixedCropperRef,
} from 'react-advanced-cropper';
import { base64ToFile } from '@/shared/utils/file';
import {
  statusLabels,
  statusColors,
  sideTypeColors,
} from '@/entities/mission/lib';
import { View } from '@/features/view';
import { session } from '@/entities/session/model';
import { ChangeMissionVersionStatusModal } from '@/features/mission/change-mission-status/ui';
import { CreateUpdateMissionVersionModal } from '@/features/mission/create-update-version/ui';
import { MissionDetailsModel } from './model';
import dayjs from 'dayjs';

type MissionFormData = {
  name: string;
  description: string;
  image: File | null;
};

const missionSchema = yup.object().shape({
  name: yup.string().required("Назва є обов'язковою"),
  description: yup.string().required("Опис є обов'язковим"),
});

export default function MissionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const missionId = params.id as string;
  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdatingMission, setIsUpdatingMission] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<CropperRef>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const missionDetailsModel = useMemo(() => new MissionDetailsModel(), []);

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
    const loadMission = async () => {
      try {
        setIsLoading(true);
        const response = await api.findMissionById(missionId);
        setMission(response.data);
        missionForm.reset({
          name: response.data.name,
          description: response.data.description,
          image: null,
        });
      } catch (error) {
        console.error('Failed to load mission:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (missionId) {
      loadMission();
    }
  }, [missionId]);

  const handleCreateVersion = () => {
    if (!mission) return;
    missionDetailsModel.createUpdateMissionVersionModel.visibility.open({
      missionId,
      mission,
    });
  };

  const handleEditVersion = (version: MissionVersion) => {
    if (!mission) return;
    missionDetailsModel.createUpdateMissionVersionModel.visibility.open({
      missionId,
      mission,
      version,
    });
  };

  const handleVersionSaved = async () => {
    // Reload mission to get updated versions
    const response = await api.findMissionById(missionId);
    setMission(response.data);
  };

  const handleUpdateMission = async (data: MissionFormData) => {
    try {
      setIsUpdatingMission(true);
      const dto: UpdateMissionDto = {
        id: missionId,
      };

      if (data.name !== mission?.name) {
        dto.name = data.name;
      }
      if (data.description !== mission?.description) {
        dto.description = data.description;
      }

      // Get cropped image if cropper is active
      if (imagePreview && cropperRef.current) {
        const base64 = cropperRef.current?.getCanvas()?.toDataURL();
        if (base64) {
          dto.image = await base64ToFile(base64, 'mission-image');
        }
      } else if (data.image) {
        dto.image = data.image;
      }

      await api.updateMission(dto);
      setIsEditDialogOpen(false);
      // Reload mission
      const response = await api.findMissionById(missionId);
      setMission(response.data);
      missionForm.reset({
        name: response.data.name,
        description: response.data.description,
        image: null,
      });
      setImagePreview('');
    } catch (error) {
      console.error('Failed to update mission:', error);
    } finally {
      setIsUpdatingMission(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      missionForm.setValue('image', null);
    }
  };

  if (isLoading) {
    return (
      <Layout showHero={false}>
        <div className='container mx-auto px-4 py-8'>
          <div className='flex items-center justify-center py-12'>
            <LoaderIcon className='size-6 animate-spin text-zinc-400' />
          </div>
        </div>
      </Layout>
    );
  }

  if (!mission) {
    return (
      <Layout showHero={false}>
        <div className='container mx-auto px-4 py-8'>
          <div className='flex flex-col items-center justify-center py-12'>
            <p className='text-zinc-400 mb-4'>Місію не знайдено</p>
            <Button
              variant='outline'
              onClick={() => router.push(ROUTES.missions.root)}>
              Повернутися до списку
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHero={false}>
      <div className='container mx-auto my-6 w-full px-4'>
        <Button
          variant='ghost'
          onClick={() => router.push(ROUTES.missions.root)}
          className='mb-4'>
          ← Повернутися до списку
        </Button>

        <div className='paper mx-auto flex w-full max-w-7xl flex-col gap-6 rounded-xl border px-5 py-5 shadow-xl lg:px-7 lg:py-6'>
          {/* Header Section */}
          <div className='flex flex-col md:flex-row md:items-start gap-6'>
            {/* Mission Image */}
            <div className='relative w-full md:w-64 aspect-video md:aspect-square overflow-hidden rounded-lg border border-white/10 flex-shrink-0'>
              {imagePreview || mission.image?.url ? (
                <Image
                  src={imagePreview || mission.image?.url || ''}
                  alt={mission?.name}
                  fill
                  className='object-cover'
                />
              ) : (
                <div className='w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center'>
                  <span className='text-zinc-500 text-sm'>
                    Немає зображення
                  </span>
                </div>
              )}
            </div>

            {/* Mission Info */}
            <div className='flex-1 flex flex-col gap-4'>
              <div className='flex items-start justify-between gap-4'>
                <div className='flex-1'>
                  <h1 className='text-3xl md:text-4xl font-bold leading-tight tracking-tight text-white mb-3'>
                    {mission?.name}
                  </h1>
                  <p className='text-zinc-300 leading-relaxed'>
                    {mission.description}
                  </p>
                </div>
                <Dialog
                  open={isEditDialogOpen}
                  onOpenChange={setIsEditDialogOpen}>
                  <DialogOverlay />
                  <DialogTrigger asChild>
                    <Button variant='outline' size='icon'>
                      <EditIcon className='size-4' />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                    <DialogHeader>
                      <DialogTitle>Редагувати місію</DialogTitle>
                    </DialogHeader>
                    <form
                      className='flex flex-col gap-4'
                      onSubmit={missionForm.handleSubmit(handleUpdateMission)}>
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
                            <span className='text-zinc-500 text-sm'>
                              Немає зображення
                            </span>
                          </div>
                        )}
                        <Button
                          type='button'
                          variant={
                            imagePreview || mission.image?.url
                              ? 'outline'
                              : 'default'
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
                            error={
                              missionForm.formState.errors.description?.message
                            }
                          />
                        )}
                      />

                      <div className='flex justify-between pt-4'>
                        <Button
                          type='button'
                          variant='outline'
                          onClick={() => {
                            setIsEditDialogOpen(false);
                            setImagePreview('');
                            missionForm.reset({
                              name: mission.name,
                              description: mission.description,
                              image: null,
                            });
                          }}>
                          Скасувати
                        </Button>
                        <Button
                          type='submit'
                          disabled={
                            isUpdatingMission || !missionForm.formState.isValid
                          }>
                          {isUpdatingMission ? (
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
              </div>
            </div>
          </div>

          {/* Versions Section */}
          <div className='border-t border-white/10 pt-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-bold text-white'>Версії місії</h2>
              <Button variant='default' onClick={handleCreateVersion}>
                <PlusIcon className='size-4' />
                Створити версію
              </Button>
            </div>

            {mission?.missionVersions?.length === 0 ? (
              <div className='paper flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-8 text-center'>
                <p className='text-zinc-400'>Версій поки немає</p>
                <Button variant='default' onClick={handleCreateVersion}>
                  <PlusIcon className='size-4' />
                  Створити першу версію
                </Button>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {mission?.missionVersions?.map((version) => (
                  <div
                    key={version.id}
                    className='paper flex flex-col gap-4 rounded-xl border p-5 shadow-lg transition-all duration-300 hover:border-lime-500/50'>
                    <div className='flex flex-col gap-4'>
                      <div className='flex items-center justify-between'>
                        <h3 className='text-lg font-bold text-white'>
                          Версія {version.version}
                        </h3>
                        <div className='flex items-center gap-2'>
                          {version.rating && (
                            <span className='text-sm text-yellow-400'>
                              ⭐ {version.rating}
                            </span>
                          )}
                          <View.Condition
                            if={
                              !session.user?.user?.isMissionReviewer ||
                              version.status !== MissionStatus.PENDING_APPROVAL
                            }>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded text-xs font-semibold border',
                                statusColors[version.status]
                              )}>
                              {statusLabels[version.status]}
                            </span>
                          </View.Condition>

                          <View.Condition
                            if={
                              session.user?.user?.isMissionReviewer &&
                              version.status === MissionStatus.PENDING_APPROVAL
                            }>
                            <Button
                              variant='secondary'
                              size='sm'
                              onClick={() => {
                                missionDetailsModel.changeMissionVersionStatusModel.visibility.open(
                                  {
                                    missionId,
                                    version,
                                    status: MissionStatus.APPROVED,
                                  }
                                );
                              }}>
                              <CheckCircleIcon className='size-4 text-green-500' />
                              Перевірено
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                missionDetailsModel.changeMissionVersionStatusModel.visibility.open(
                                  {
                                    missionId,
                                    version,
                                    status: MissionStatus.CHANGES_REQUESTED,
                                  }
                                );
                              }}>
                              <BanIcon className='size-4 text-destructive' />
                              Потребує змін
                            </Button>
                          </View.Condition>
                        </div>
                      </div>

                      <div className='flex flex-col gap-3'>
                        {/* Attack Side */}
                        <div className='flex flex-col gap-1.5 p-3 rounded-lg bg-black/40 border border-white/5'>
                          <div className='flex items-center justify-between'>
                            <span className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
                              Атака
                            </span>
                            <span
                              className={cn(
                                'text-xs font-semibold',
                                sideTypeColors[version.attackSideType]
                              )}>
                              {version.attackSideType}
                            </span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span
                              className={cn(
                                'font-semibold',
                                sideTypeColors[version.attackSideType]
                              )}>
                              {version.attackSideName}
                            </span>
                            <div className='flex items-center gap-1.5'>
                              <UsersIcon className='size-3.5 text-zinc-400' />
                              <span
                                className={cn(
                                  'text-sm font-medium',
                                  sideTypeColors[version.attackSideType]
                                )}>
                                {version.attackSideSlots} слотів
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Defense Side */}
                        <div className='flex flex-col gap-1.5 p-3 rounded-lg bg-black/40 border border-white/5'>
                          <div className='flex items-center justify-between'>
                            <span className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
                              Оборона
                            </span>
                            <span
                              className={cn(
                                'text-xs font-semibold',
                                sideTypeColors[version.defenseSideType]
                              )}>
                              {version.defenseSideType}
                            </span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span
                              className={cn(
                                'font-semibold',
                                sideTypeColors[version.defenseSideType]
                              )}>
                              {version.defenseSideName}
                            </span>
                            <div className='flex items-center gap-1.5'>
                              <UsersIcon className='size-3.5 text-zinc-400' />
                              <span
                                className={cn(
                                  'text-sm font-medium',
                                  sideTypeColors[version.defenseSideType]
                                )}>
                                {version.defenseSideSlots} слотів
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-2 text-xs text-zinc-400 pt-2 border-t border-white/5'>
                        <CalendarIcon className='size-3.5' />
                        Останні зміни:{' '}
                        <span>
                          {dayjs(version.updatedAt).format('DD.MM.YYYY HH:mm')}
                        </span>
                      </div>

                      <div className='flex gap-2'>
                        {version.file?.url && (
                          <Button
                            variant='outline'
                            className='flex-1'
                            onClick={() =>
                              window.open(version.file?.url, '_blank')
                            }>
                            <DownloadIcon className='size-4' />
                            Завантажити
                          </Button>
                        )}
                        <Button
                          variant='outline'
                          size={version.file?.url ? 'default' : 'default'}
                          className={version.file?.url ? '' : 'w-full'}
                          onClick={() => handleEditVersion(version)}>
                          <EditIcon className='size-4' />
                          {version.file?.url ? '' : 'Редагувати'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ChangeMissionVersionStatusModal
        model={missionDetailsModel.changeMissionVersionStatusModel}
        onSuccess={async (status) => {
          // Reload mission to get updated versions
          const response = await api.findMissionById(missionId);
          setMission(response.data);
        }}
      />
      <CreateUpdateMissionVersionModal
        model={missionDetailsModel.createUpdateMissionVersionModel}
        onSuccess={handleVersionSaved}
      />
    </Layout>
  );
}
