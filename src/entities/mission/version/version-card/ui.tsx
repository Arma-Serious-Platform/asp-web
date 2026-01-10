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
import {
  MissionVersion,
  MissionStatus,
} from '@/shared/sdk/types';
import {
  statusLabels,
  statusColors,
  sideTypeColors,
} from '@/entities/mission/lib';
import { View } from '@/features/view';
import { session } from '@/entities/session/model';
import { FC, useState } from 'react';
import dayjs from 'dayjs';
import { WeaponrySection } from './weaponry-section';

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
  const [isAttackWeaponryOpen, setIsAttackWeaponryOpen] = useState(false);
  const [isDefenseWeaponryOpen, setIsDefenseWeaponryOpen] = useState(false);

  const attackWeaponry = (version.weaponry || []).filter(
    (w) => w.type === version.attackSideType
  );
  const defenseWeaponry = (version.weaponry || []).filter(
    (w) => w.type === version.defenseSideType
  );

  return (
    <div className='paper flex flex-col gap-4 rounded-xl border p-5 shadow-lg transition-all duration-300 hover:border-lime-500/50 relative'>
      <div className='flex flex-col gap-4 pb-16'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <h3 className='text-lg font-bold text-white'>
              Версія {version.version}
            </h3>
            {version.rating && (
              <span className='text-sm text-yellow-400'>
                ⭐ {version.rating}
              </span>
            )}
          </div>
          <div className='flex items-center gap-2'>
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

        {/* Sides */}
        <div className='flex flex-col sm:flex-row gap-3'>
          {/* Attack Side */}
          <div className='flex flex-col gap-3 p-4 rounded-lg bg-black/40 border border-white/5 flex-1 transition-colors hover:border-white/10'>
            <div className='flex flex-col gap-2'>
              <span className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
                Атака
              </span>
              <div className='flex items-center justify-between'>
                <span
                  className={cn(
                    'text-lg font-bold',
                    sideTypeColors[version.attackSideType]
                  )}>
                  {version.attackSideName}
                </span>
                <div className='flex items-center gap-1.5'>
                  <UsersIcon className='size-4 text-zinc-400' />
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      sideTypeColors[version.attackSideType]
                    )}>
                    {version.attackSideSlots}
                  </span>
                </div>
              </div>
            </div>
            <WeaponrySection
              weaponry={attackWeaponry}
              isOpen={isAttackWeaponryOpen}
              setIsOpen={setIsAttackWeaponryOpen}
              sideType={version.attackSideType}
            />
          </div>

          {/* Defense Side */}
          <div className='flex flex-col gap-3 p-4 rounded-lg bg-black/40 border border-white/5 flex-1 transition-colors hover:border-white/10'>
            <div className='flex flex-col gap-2'>
              <span className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
                Оборона
              </span>
              <div className='flex items-center justify-between'>
                <span
                  className={cn(
                    'text-lg font-bold',
                    sideTypeColors[version.defenseSideType]
                  )}>
                  {version.defenseSideName}
                </span>
                <div className='flex items-center gap-1.5'>
                  <UsersIcon className='size-4 text-zinc-400' />
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      sideTypeColors[version.defenseSideType]
                    )}>
                    {version.defenseSideSlots}
                  </span>
                </div>
              </div>
            </div>
            <WeaponrySection
              weaponry={defenseWeaponry}
              isOpen={isDefenseWeaponryOpen}
              setIsOpen={setIsDefenseWeaponryOpen}
              sideType={version.defenseSideType}
            />
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center gap-2 text-xs text-zinc-400 pt-2 border-t border-white/5'>
          <CalendarIcon className='size-3.5' />
          <span>
            Останні зміни: {dayjs(version.updatedAt).format('DD.MM.YYYY HH:mm')}
          </span>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className='absolute bottom-0 left-0 right-0 p-5 pt-0 flex gap-2 bg-gradient-to-t from-black/95 via-black/90 to-transparent'>
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
  );
};
