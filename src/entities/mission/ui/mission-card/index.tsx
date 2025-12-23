'use client';

import { FC } from 'react';
import { Mission, MissionStatus } from '@/shared/sdk/types';
import { Card } from '@/shared/ui/atoms/card';
import { Button } from '@/shared/ui/atoms/button';
import { ROUTES } from '@/shared/config/routes';
import Link from 'next/link';
import Image from 'next/image';
import { EyeIcon, CalendarIcon, UsersIcon } from 'lucide-react';
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

export const MissionCard: FC<{ mission: Mission }> = ({ mission }) => {
  const totalSlots = mission.versions.length > 0
    ? Math.max(
        ...mission.versions.map(
          (v) => v.attackSideSlots + v.defenseSideSlots
        )
      )
    : 0;

  return (
    <Card className='group hover:border-lime-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-lime-500/10'>
      <div className='flex flex-col gap-4'>
        {/* Image */}
        <div className='relative w-full aspect-video overflow-hidden rounded-lg border border-white/10'>
          {mission.image?.url ? (
            <Image
              src={mission.image.url}
              alt={mission.title}
              fill
              className='object-cover transition-transform duration-300 group-hover:scale-105'
            />
          ) : (
            <div className='w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center'>
              <span className='text-zinc-500 text-sm'>Немає зображення</span>
            </div>
          )}
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
          
          {/* Status Badge */}
          <div className='absolute top-3 right-3'>
            <span
              className={cn(
                'px-2 py-1 rounded text-xs font-semibold border',
                statusColors[mission.status]
              )}>
              {statusLabels[mission.status]}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className='flex flex-col gap-3'>
          <div>
            <h3 className='text-xl font-bold text-white mb-1 line-clamp-2'>
              {mission.title}
            </h3>
            <p className='text-sm text-zinc-400 line-clamp-2'>
              {mission.description}
            </p>
          </div>

          {/* Stats */}
          <div className='flex items-center gap-4 text-sm text-zinc-400'>
            {totalSlots > 0 && (
              <div className='flex items-center gap-1.5'>
                <UsersIcon className='size-4' />
                <span>{totalSlots} слотів</span>
              </div>
            )}
            <div className='flex items-center gap-1.5'>
              <CalendarIcon className='size-4' />
              <span>{new Date(mission.createdAt).toLocaleDateString('uk-UA')}</span>
            </div>
            {mission.versions.length > 0 && (
              <span className='text-xs'>
                {mission.versions.length} версій
              </span>
            )}
          </div>

          {/* Actions */}
          <Link href={ROUTES.missions.id(mission.id)}>
            <Button variant='default' className='w-full'>
              <EyeIcon className='size-4' />
              Переглянути
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

