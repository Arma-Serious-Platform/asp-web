'use client';

import { Layout } from '@/widgets/layout';
import { Button } from '@/shared/ui/atoms/button';
import { api } from '@/shared/sdk';
import {
  Mission,
  MissionStatus,
  MissionVersion,
} from '@/shared/sdk/types';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  PlusIcon,
  LoaderIcon,
  EditIcon,
} from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import { ChangeMissionVersionStatusModal } from '@/features/mission/change-mission-status/ui';
import { CreateUpdateMissionVersionModal } from '@/features/mission/create-update-version/ui';
import { UpdateMissionModal } from '@/features/mission/update-mission/ui';
import { MissionDetailsModel } from './model';
import { MissionVersionCard } from '@/entities/mission/version/version-card/ui';

export default function MissionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const missionId = params.id as string;
  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const missionDetailsModel = useMemo(() => new MissionDetailsModel(), []);

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

  const handleMissionUpdate = () => {
    if (!mission) return;
    missionDetailsModel.updateMissionModel.visibility.open({
      mission,
    });
  };

  const handleMissionSaved = async () => {
    // Reload mission
    const response = await api.findMissionById(missionId);
    setMission(response.data);
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
              {mission.image?.url ? (
                <Image
                  src={mission.image.url}
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
                <UpdateMissionModal
                  model={missionDetailsModel.updateMissionModel}
                  onSuccess={handleMissionSaved}>
                  <Button variant='outline' size='icon'>
                    <EditIcon className='size-4' />
                  </Button>
                </UpdateMissionModal>
              </div>
            </div>
          </div>

          {/* Last Version Details */}
          {mission?.missionVersions &&
            mission.missionVersions.length > 0 && (
              <div className='border-t border-white/10 pt-6'>
                <h2 className='text-xl font-bold text-white mb-4'>
                  Остання версія:{' '}
                  {
                    mission.missionVersions[mission.missionVersions.length - 1]
                      .version
                  }
                </h2>
                <MissionVersionCard
                  version={
                    mission.missionVersions?.[0]
                  }
                  missionId={missionId}
                  onEdit={handleEditVersion}
                  onChangeStatus={(params) => {
                    missionDetailsModel.changeMissionVersionStatusModel.visibility.open(
                      params
                    );
                  }}
                />
              </div>
            )}

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
                  <MissionVersionCard
                    key={version.id}
                    version={version}
                    missionId={missionId}
                    onEdit={handleEditVersion}
                    onChangeStatus={(params) => {
                      missionDetailsModel.changeMissionVersionStatusModel.visibility.open(
                        params
                      );
                    }}
                  />
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
      <UpdateMissionModal
        model={missionDetailsModel.updateMissionModel}
        onSuccess={handleMissionSaved}
      />
    </Layout>
  );
}
