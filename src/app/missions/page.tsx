'use client';

import { Layout } from '@/widgets/layout';
import { MissionModel } from '@/entities/mission/model';
import { MissionCard } from '@/entities/mission/ui/mission-card';
import { Button } from '@/shared/ui/atoms/button';
import { Input, NumericInput } from '@/shared/ui/atoms/input';
import { Select } from '@/shared/ui/atoms/select';
import { MissionStatus } from '@/shared/sdk/types';
import { UserModel } from '@/entities/user/model';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';

const missionModel = new MissionModel();
const userModel = new UserModel();

const MissionsPage = observer(() => {
  const [usersLoaded, setUsersLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      await missionModel.init();
      await userModel.pagination.loadAll();
      setUsersLoaded(true);
    };
    init();
  }, []);

  const statusOptions = [
    { label: 'Всі статуси', value: '' },
    { label: 'Схвалено', value: MissionStatus.APPROVED },
    { label: 'Очікує схвалення', value: MissionStatus.PENDING_APPROVAL },
    { label: 'Потрібні зміни', value: MissionStatus.CHANGES_REQUESTED },
  ];

  const userOptions = [
    { label: 'Всі користувачі', value: '' },
    ...userModel.options,
  ];

  return (
    <Layout showHero={false} className='container paper mx-auto my-4'>
      <div className='container mx-auto px-4 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold leading-tight tracking-tight text-white mb-2'>
            Місії
          </h1>
          <p className='text-zinc-400'>
            Перегляньте всі доступні місії та створіть нову
          </p>
        </div>

        {/* Filters */}
        <div className='mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Select
            label='Статус'
            options={statusOptions}
            value={missionModel.statusFilter || ''}
            onChange={(value) =>
              missionModel.setStatusFilter(
                value ? (value as MissionStatus) : null
              )
            }
          />
          <Select
            label='Автор'
            options={userOptions}
            value={missionModel.authorIdFilter || ''}
            onChange={(value) => missionModel.setAuthorIdFilter(value || null)}
            isLoading={!usersLoaded}
          />
          <NumericInput
            label='Мін. слотів'
            placeholder='0'
            value={missionModel.minSlotsFilter?.toString() || ''}
            onChange={(e) =>
              missionModel.setMinSlotsFilter(
                e.target.value ? parseInt(e.target.value) : null
              )
            }
          />
          <NumericInput
            label='Макс. слотів'
            placeholder='0'
            value={missionModel.maxSlotsFilter?.toString() || ''}
            onChange={(e) =>
              missionModel.setMaxSlotsFilter(
                e.target.value ? parseInt(e.target.value) : null
              )
            }
          />
        </div>

        {/* Missions Grid */}
        {missionModel.pagination.preloader.isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='text-zinc-400'>Завантаження...</div>
          </div>
        ) : (
          <>
            {/* Create Mission Button */}
            <div className='flex justify-end mb-4'>
              <Link href='/mission/create'>
                <Button variant='default'>
                  <PlusIcon className='size-4' />
                  Додати місію
                </Button>
              </Link>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8'>
              {missionModel.filteredMissions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
});

export default MissionsPage;
