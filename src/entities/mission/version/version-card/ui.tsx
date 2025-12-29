'use client';

import { Button } from '@/shared/ui/atoms/button';
import { cn } from '@/shared/utils/cn';
import {
  CalendarIcon,
  UsersIcon,
  DownloadIcon,
  EditIcon,
  CheckCircleIcon,
  BanIcon,
} from 'lucide-react';
import { MissionVersion, MissionStatus } from '@/shared/sdk/types';
import { statusLabels, statusColors, sideTypeColors } from '@/entities/mission/lib';
import { View } from '@/features/view';
import { session } from '@/entities/session/model';
import { FC } from 'react';
import dayjs from 'dayjs';

type MissionVersionCardProps = {
  version: MissionVersion;
  missionId: string;
  onEdit: (version: MissionVersion) => void;
  onChangeStatus: (params: {
    missionId: string;
    version: MissionVersion;
    status: MissionStatus;
  }) => void;
};

export const MissionVersionCard: FC<MissionVersionCardProps> = ({
  version,
  missionId,
  onEdit,
  onChangeStatus,
}) => {
  const attackWeaponry = (version.weaponry || []).filter(
    (w) => w.type === version.attackSideType
  );
  const defenseWeaponry = (version.weaponry || []).filter(
    (w) => w.type === version.defenseSideType
  );

  return (
    <div className='paper flex flex-col gap-4 rounded-xl border p-5 shadow-lg transition-all duration-300 hover:border-lime-500/50'>
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-bold text-white'>Версія {version.version}</h3>
          <div className='flex items-center gap-2'>
            {version.rating && (
              <span className='text-sm text-yellow-400'>⭐ {version.rating}</span>
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
                  onChangeStatus({
                    missionId,
                    version,
                    status: MissionStatus.APPROVED,
                  });
                }}>
                <CheckCircleIcon className='size-4 text-green-500' />
                Перевірено
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  onChangeStatus({
                    missionId,
                    version,
                    status: MissionStatus.CHANGES_REQUESTED,
                  });
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
            {attackWeaponry.length > 0 && (
              <div className='mt-2 pt-2 border-t border-white/5'>
                <span
                  className={cn(
                    'text-xs font-semibold',
                    sideTypeColors[version.attackSideType]
                  )}>
                  Озброєння ({attackWeaponry.length})
                </span>
                <div className='mt-1.5 flex flex-col gap-1'>
                  {attackWeaponry.map((weaponry, index) => (
                    <div
                      key={weaponry.id || index}
                      className='p-1.5 rounded bg-black/40 border border-white/5'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1'>
                          <div className='font-medium text-sm text-white'>
                            {weaponry.name}
                          </div>
                          {weaponry.description && (
                            <div className='text-xs text-zinc-400 mt-0.5'>
                              {weaponry.description}
                            </div>
                          )}
                        </div>
                        <span className='text-sm font-semibold text-zinc-300'>
                          x{weaponry.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            {defenseWeaponry.length > 0 && (
              <div className='mt-2 pt-2 border-t border-white/5'>
                <span
                  className={cn(
                    'text-xs font-semibold',
                    sideTypeColors[version.defenseSideType]
                  )}>
                  Озброєння ({defenseWeaponry.length})
                </span>
                <div className='mt-1.5 flex flex-col gap-1'>
                  {defenseWeaponry.map((weaponry, index) => (
                    <div
                      key={weaponry.id || index}
                      className='p-1.5 rounded bg-black/40 border border-white/5'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1'>
                          <div className='font-medium text-sm text-white'>
                            {weaponry.name}
                          </div>
                          {weaponry.description && (
                            <div className='text-xs text-zinc-400 mt-0.5'>
                              {weaponry.description}
                            </div>
                          )}
                        </div>
                        <span className='text-sm font-semibold text-zinc-300'>
                          x{weaponry.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2 text-xs text-zinc-400 pt-2 border-t border-white/5'>
          <CalendarIcon className='size-3.5' />
          Останні зміни:{' '}
          <span>{dayjs(version.updatedAt).format('DD.MM.YYYY HH:mm')}</span>
        </div>

        <div className='flex gap-2'>
          {version.file?.url && (
            <Button
              variant='outline'
              className='flex-1'
              onClick={() => window.open(version.file?.url, '_blank')}>
              <DownloadIcon className='size-4' />
              Завантажити
            </Button>
          )}
          <Button
            variant='outline'
            size={version.file?.url ? 'default' : 'default'}
            className={version.file?.url ? '' : 'w-full'}
            onClick={() => onEdit(version)}>
            <EditIcon className='size-4' />
            {version.file?.url ? '' : 'Редагувати'}
          </Button>
        </div>
      </div>
    </div>
  );
};

