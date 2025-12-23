'use client';

import { Layout } from '@/widgets/layout';
import { Card } from '@/shared/ui/atoms/card';
import { Button } from '@/shared/ui/atoms/button';
import { api } from '@/shared/sdk';
import { Mission, MissionStatus, MissionGameSide, CreateMissionVersionDto } from '@/shared/sdk/types';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlusIcon, DownloadIcon, CalendarIcon, UsersIcon, LoaderIcon } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '@/shared/ui/atoms/input';
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
  [MissionStatus.APPROVED]: 'Схвалено',
  [MissionStatus.PENDING_APPROVAL]: 'Очікує схвалення',
  [MissionStatus.CHANGES_REQUESTED]: 'Потрібні зміни',
};

const statusColors: Record<MissionStatus, string> = {
  [MissionStatus.APPROVED]: 'bg-green-500/20 text-green-400 border-green-500/30',
  [MissionStatus.PENDING_APPROVAL]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  [MissionStatus.CHANGES_REQUESTED]: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const sideTypeOptions = [
  { label: 'BLUE', value: MissionGameSide.BLUE },
  { label: 'RED', value: MissionGameSide.RED },
  { label: 'GREEN', value: MissionGameSide.GREEN },
];

const versionSchema = yup.object().shape({
  version: yup.string().required("Версія є обов'язковою"),
  attackSideType: yup.string().required("Тип атакуючої сторони є обов'язковим"),
  defenseSideType: yup.string().required("Тип оборонної сторони є обов'язковим"),
  attackSideSlots: yup.number().required("Кількість слотів атакуючої сторони є обов'язковою").min(1),
  defenseSideSlots: yup.number().required("Кількість слотів оборонної сторони є обов'язковою").min(1),
  attackSideName: yup.string().required("Назва атакуючої сторони є обов'язковою"),
  defenseSideName: yup.string().required("Назва оборонної сторони є обов'язковою"),
  file: yup.mixed().required("Файл є обов'язковим"),
});

export default function MissionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const missionId = params.id as string;
  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);

  const versionForm = useForm<CreateMissionVersionDto & { file: File | null }>({
    mode: 'onChange',
    resolver: yupResolver(versionSchema),
    defaultValues: {
      version: '',
      attackSideType: MissionGameSide.BLUE,
      defenseSideType: MissionGameSide.RED,
      attackSideSlots: 0,
      defenseSideSlots: 0,
      attackSideName: '',
      defenseSideName: '',
      file: null,
    },
  });

  useEffect(() => {
    const loadMission = async () => {
      try {
        setIsLoading(true);
        const response = await api.findMissionById(missionId);
        setMission(response.data);
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

  const handleCreateVersion = async (data: CreateMissionVersionDto & { file: File | null }) => {
    if (!data.file) return;

    try {
      setIsCreatingVersion(true);
      await api.createMissionVersion(missionId, {
        ...data,
        file: data.file,
        missionId,
      });
      setIsVersionDialogOpen(false);
      versionForm.reset();
      // Reload mission to get updated versions
      const response = await api.findMissionById(missionId);
      setMission(response.data);
    } catch (error) {
      console.error('Failed to create version:', error);
    } finally {
      setIsCreatingVersion(false);
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
            <Button variant='outline' onClick={() => router.push(ROUTES.missions.root)}>
              Повернутися до списку
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHero={false}>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-6xl mx-auto'>
          {/* Header */}
          <div className='mb-8'>
            <Button
              variant='ghost'
              onClick={() => router.push(ROUTES.missions.root)}
              className='mb-4'>
              ← Повернутися до списку
            </Button>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h1 className='text-3xl font-bold leading-tight tracking-tight text-white mb-2'>
                  {mission.title}
                </h1>
                <p className='text-zinc-400'>{mission.description}</p>
              </div>
              <span
                className={cn(
                  'px-3 py-1 rounded text-sm font-semibold border',
                  statusColors[mission.status]
                )}>
                {statusLabels[mission.status]}
              </span>
            </div>
          </div>

          {/* Mission Image */}
          {mission.image?.url && (
            <div className='relative w-full aspect-video overflow-hidden rounded-xl border border-white/10 mb-8'>
              <Image
                src={mission.image.url}
                alt={mission.title}
                fill
                className='object-cover'
              />
            </div>
          )}

          {/* Versions Section */}
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-bold text-white'>Версії місії</h2>
              <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
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
                            error={versionForm.formState.errors.attackSideType?.message}
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
                            error={versionForm.formState.errors.defenseSideType?.message}
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
                            error={versionForm.formState.errors.attackSideName?.message}
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
                            error={versionForm.formState.errors.defenseSideName?.message}
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
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            error={versionForm.formState.errors.attackSideSlots?.message}
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
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            error={versionForm.formState.errors.defenseSideSlots?.message}
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
                          <input
                            {...field}
                            type='file'
                            accept='.pbo,.p3d'
                            onChange={(e) => onChange(e.target.files?.[0] || null)}
                            className='flex w-full rounded-md border border-neutral-700 bg-black/70 px-3 py-2 text-sm text-zinc-100'
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
                        disabled={isCreatingVersion || !versionForm.formState.isValid}>
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

            {mission.versions.length === 0 ? (
              <Card className='p-8 text-center'>
                <p className='text-zinc-400 mb-4'>Версій поки немає</p>
                <Button
                  variant='default'
                  onClick={() => setIsVersionDialogOpen(true)}>
                  <PlusIcon className='size-4' />
                  Створити першу версію
                </Button>
              </Card>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {mission.versions.map((version) => (
                  <Card key={version.id} className='p-4'>
                    <div className='flex flex-col gap-3'>
                      <div className='flex items-center justify-between'>
                        <h3 className='text-lg font-bold text-white'>
                          Версія {version.version}
                        </h3>
                        {version.rating && (
                          <span className='text-sm text-yellow-400'>
                            ⭐ {version.rating}
                          </span>
                        )}
                      </div>

                      <div className='flex flex-col gap-2 text-sm'>
                        <div className='flex items-center gap-2'>
                          <span className='text-zinc-400'>Атака:</span>
                          <span className='text-white font-semibold'>
                            {version.attackSideName} ({version.attackSideType})
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-zinc-400'>Оборона:</span>
                          <span className='text-white font-semibold'>
                            {version.defenseSideName} ({version.defenseSideType})
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <UsersIcon className='size-4 text-zinc-400' />
                          <span className='text-zinc-400'>
                            {version.attackSideSlots + version.defenseSideSlots} слотів
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <CalendarIcon className='size-4 text-zinc-400' />
                          <span className='text-zinc-400'>
                            {new Date(version.createdAt).toLocaleDateString('uk-UA')}
                          </span>
                        </div>
                      </div>

                      {version.file?.url && (
                        <Button
                          variant='outline'
                          className='w-full'
                          onClick={() => window.open(version.file?.url, '_blank')}>
                          <DownloadIcon className='size-4' />
                          Завантажити
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

