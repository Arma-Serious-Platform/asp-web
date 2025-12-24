'use client';

import { Layout } from '@/widgets/layout';
import { Card } from '@/shared/ui/atoms/card';
import { Button } from '@/shared/ui/atoms/button';
import { api } from '@/shared/sdk';
import {
  Mission,
  MissionStatus,
  MissionGameSide,
  CreateMissionVersionDto,
  UpdateMissionDto,
} from '@/shared/sdk/types';
import { useEffect, useRef, useState } from 'react';
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
} from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '@/shared/ui/atoms/input';
import { Textarea } from '@/shared/ui/atoms/textarea';
import { Select } from '@/shared/ui/atoms/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/organisms/dialog';
import { cn } from '@/shared/utils/cn';

const statusLabels: Record<MissionStatus, string> = {
  [MissionStatus.APPROVED]: 'Перевірено',
  [MissionStatus.PENDING_APPROVAL]: 'Очікує перевірки',
  [MissionStatus.CHANGES_REQUESTED]: 'Потрібні зміни',
};

const statusColors: Record<MissionStatus, string> = {
  [MissionStatus.APPROVED]:
    'bg-green-500/20 text-green-400 border-green-500/30',
  [MissionStatus.PENDING_APPROVAL]:
    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  [MissionStatus.CHANGES_REQUESTED]:
    'bg-red-500/20 text-red-400 border-red-500/30',
};

const sideTypeColors: Record<MissionGameSide, string> = {
  [MissionGameSide.BLUE]: 'text-blue-400',
  [MissionGameSide.RED]: 'text-red-400',
  [MissionGameSide.GREEN]: 'text-green-400',
};

const sideTypeOptions = [
  { label: 'BLUE', value: MissionGameSide.BLUE },
  { label: 'RED', value: MissionGameSide.RED },
  { label: 'GREEN', value: MissionGameSide.GREEN },
];

type VersionFormData = {
  version: string;
  missionId: string;
  attackSideType: MissionGameSide;
  defenseSideType: MissionGameSide;
  attackSideSlots: number;
  defenseSideSlots: number;
  attackSideName: string;
  defenseSideName: string;
  file: File | null;
};

type MissionFormData = {
  name: string;
  description: string;
  image: File | null;
};

const createVersionSchema = (missionId: string) =>
  yup.object().shape({
    version: yup.string().required("Обов'язково"),
    missionId: yup.string().required("Обов'язково").default(missionId),
    attackSideType: yup.string().required("Обов'язково"),
    defenseSideType: yup.string().required("Обов'язково"),
    attackSideSlots: yup.number().required("Обов'язково").min(1),
    defenseSideSlots: yup.number().required("Обов'язково").min(1),
    attackSideName: yup.string().required("Обов'язково"),
    defenseSideName: yup.string().required("Обов'язково"),
    file: yup.mixed().required("Обов'язково"),
  });

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
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdatingMission, setIsUpdatingMission] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const versionForm = useForm<VersionFormData>({
    mode: 'onChange',
    resolver: yupResolver(createVersionSchema(missionId)) as any,
    defaultValues: {
      version: '',
      missionId: missionId,
      attackSideType: MissionGameSide.BLUE,
      defenseSideType: MissionGameSide.RED,
      attackSideSlots: 0,
      defenseSideSlots: 0,
      attackSideName: '',
      defenseSideName: '',
      file: null,
    },
  });

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

  const handleCreateVersion = async (data: VersionFormData) => {
    if (!data.file) return;

    try {
      setIsCreatingVersion(true);
      await api.createMissionVersion(missionId, {
        version: data.version,
        missionId: missionId,
        attackSideType: data.attackSideType as MissionGameSide,
        defenseSideType: data.defenseSideType as MissionGameSide,
        attackSideSlots: data.attackSideSlots,
        defenseSideSlots: data.defenseSideSlots,
        attackSideName: data.attackSideName,
        defenseSideName: data.defenseSideName,
        file: data.file,
      });
      setIsVersionDialogOpen(false);
      versionForm.reset({
        version: '',
        missionId: missionId,
        attackSideType: MissionGameSide.BLUE,
        defenseSideType: MissionGameSide.RED,
        attackSideSlots: 0,
        defenseSideSlots: 0,
        attackSideName: '',
        defenseSideName: '',
        file: null,
      });
      // Reload mission to get updated versions
      const response = await api.findMissionById(missionId);
      setMission(response.data);
    } catch (error) {
      console.error('Failed to create version:', error);
    } finally {
      setIsCreatingVersion(false);
    }
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
      if (data.image) {
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
      missionForm.setValue('image', file);
      setImagePreview(URL.createObjectURL(file));
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
            <div className='relative w-full md:w-96 aspect-video md:aspect-square overflow-hidden rounded-lg border border-white/10 flex-shrink-0'>
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
                  <p className='text-zinc-300 text-lg leading-relaxed'>
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
                            onSubmit={missionForm.handleSubmit(
                              handleUpdateMission
                            )}>
                            <div className='flex flex-col gap-4'>
                              <input
                                ref={imageRef}
                                type='file'
                                accept='image/png, image/jpeg, image/jpg, image/webp, image/gif'
                                onChange={handleImageChange}
                                className='hidden'
                                id='mission-image-upload'
                              />
                              {(imagePreview || mission.image?.url) && (
                                <div className='relative w-full aspect-video overflow-hidden rounded-lg border border-white/10'>
                                  <Image
                                    src={imagePreview || mission.image?.url || ''}
                                    alt='Preview'
                                    fill
                                    className='object-cover'
                                  />
                                </div>
                              )}
                              <label htmlFor='mission-image-upload'>
                                <Button
                                  type='button'
                                  variant='outline'
                                  className='w-full'>
                                  <UploadIcon className='size-4' />
                                  {missionForm.watch('image')
                                    ? 'Змінити зображення'
                                    : 'Обрати зображення'}
                                </Button>
                              </label>
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
                                    missionForm.formState.errors.description
                                      ?.message
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
                                  isUpdatingMission ||
                                  !missionForm.formState.isValid
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
                  <Dialog
                    open={isVersionDialogOpen}
                    onOpenChange={setIsVersionDialogOpen}>
                    <DialogOverlay />
                    <DialogTrigger asChild>
                      <Button variant='default'>
                        <PlusIcon className='size-4' />
                        Створити версію
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                      <DialogHeader>
                        <DialogTitle>Створити нову версію</DialogTitle>
                      </DialogHeader>
                      <form
                        className='flex flex-col gap-4'
                        onSubmit={versionForm.handleSubmit(handleCreateVersion)}>
                        <Controller
                          control={versionForm.control}
                          name='version'
                          render={({ field }) => (
                            <Input
                              {...field}
                              label='Версія'
                              placeholder='v1.0'
                              error={versionForm.formState.errors.version?.message}
                            />
                          )}
                        />

                        <div className='grid grid-cols-2 gap-4'>
                          <Controller
                            control={versionForm.control}
                            name='attackSideType'
                            render={({ field }) => (
                              <Select
                                label='Тип атакуючої сторони'
                                options={sideTypeOptions}
                                value={field.value}
                                onChange={field.onChange}
                                error={
                                  versionForm.formState.errors.attackSideType
                                    ?.message
                                }
                              />
                            )}
                          />
                          <Controller
                            control={versionForm.control}
                            name='defenseSideType'
                            render={({ field }) => (
                              <Select
                                label='Тип оборонної сторони'
                                options={sideTypeOptions}
                                value={field.value}
                                onChange={field.onChange}
                                error={
                                  versionForm.formState.errors.defenseSideType
                                    ?.message
                                }
                              />
                            )}
                          />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                          <Controller
                            control={versionForm.control}
                            name='attackSideName'
                            render={({ field }) => (
                              <Input
                                {...field}
                                label='Назва атакуючої сторони'
                                error={
                                  versionForm.formState.errors.attackSideName
                                    ?.message
                                }
                              />
                            )}
                          />
                          <Controller
                            control={versionForm.control}
                            name='defenseSideName'
                            render={({ field }) => (
                              <Input
                                {...field}
                                label='Назва оборонної сторони'
                                error={
                                  versionForm.formState.errors.defenseSideName
                                    ?.message
                                }
                              />
                            )}
                          />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                          <Controller
                            control={versionForm.control}
                            name='attackSideSlots'
                            render={({ field }) => (
                              <Input
                                {...field}
                                type='number'
                                label='Слоти атакуючої сторони'
                                value={field.value || ''}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                                error={
                                  versionForm.formState.errors.attackSideSlots
                                    ?.message
                                }
                              />
                            )}
                          />
                          <Controller
                            control={versionForm.control}
                            name='defenseSideSlots'
                            render={({ field }) => (
                              <Input
                                {...field}
                                type='number'
                                label='Слоти оборонної сторони'
                                value={field.value || ''}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                                error={
                                  versionForm.formState.errors.defenseSideSlots
                                    ?.message
                                }
                              />
                            )}
                          />
                        </div>

                        <Controller
                          control={versionForm.control}
                          name='file'
                          render={({ field: { onChange, value, ...field } }) => (
                            <div className='flex flex-col gap-2'>
                              <label className='text-sm font-semibold text-zinc-300'>
                                Файл місії
                              </label>
                              <Button
                                variant='outline'
                                className='w-full'
                                onClick={(e) => {
                                  e.preventDefault();
                                  fileRef.current?.click();
                                }}>
                                <UploadIcon className='size-4' />
                                {value ? 'Змінити файл' : 'Обрати файл'}
                              </Button>
                              <input
                                ref={fileRef}
                                type='file'
                                accept='.pbo,.p3d'
                                onChange={(e) =>
                                  onChange(e.target.files?.[0] || null)
                                }
                                className='invisible'
                              />
                              {versionForm.formState.errors.file && (
                                <p className='text-sm text-red-400'>
                                  {versionForm.formState.errors.file.message}
                                </p>
                              )}
                            </div>
                          )}
                        />

                        <div className='flex justify-between pt-4'>
                          <Button
                            type='button'
                            variant='outline'
                            onClick={() => setIsVersionDialogOpen(false)}>
                            Скасувати
                          </Button>
                          <Button
                            type='submit'
                            disabled={
                              isCreatingVersion || !versionForm.formState.isValid
                            }>
                            {isCreatingVersion ? (
                              <>
                                <LoaderIcon className='size-4 animate-spin' />
                                Створення...
                              </>
                            ) : (
                              'Створити версію'
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {mission?.missionVersions?.length === 0 ? (
                  <div className='paper flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-8 text-center'>
                    <p className='text-zinc-400'>Версій поки немає</p>
                    <Button
                      variant='default'
                      onClick={() => setIsVersionDialogOpen(true)}>
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
                              <span
                                className={cn(
                                  'px-2 py-0.5 rounded text-xs font-semibold border',
                                  statusColors[version.status]
                                )}>
                                {statusLabels[version.status]}
                              </span>
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
                            <span>
                              {new Date(version.createdAt).toLocaleDateString(
                                'uk-UA'
                              )}
                            </span>
                          </div>

                          {version.file?.url && (
                            <Button
                              variant='outline'
                              className='w-full'
                              onClick={() =>
                                window.open(version.file?.url, '_blank')
                              }>
                              <DownloadIcon className='size-4' />
                              Завантажити
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
