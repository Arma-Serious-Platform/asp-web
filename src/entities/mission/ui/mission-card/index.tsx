'use client';

import { FC } from 'react';
import { Mission, MissionGameSide, State, MissionType } from '@/shared/sdk/types';
import { Card } from '@/shared/ui/atoms/card';
import { Button } from '@/shared/ui/atoms/button';
import { ROUTES } from '@/shared/config/routes';
import Link from 'next/link';
import Image from 'next/image';
import { EyeIcon, UsersIcon, LayersIcon, MilestoneIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { missionTypeLabels, statusLabels, statusColors, sideTypeColors } from '@/entities/mission/lib';
import { MissionAuthorsText } from '@/entities/mission/mission-authors-text';
import { MessageContent } from '@/entities/comment/lexical-message';

type SideInfoProps = {
  label: string;
  sideName: string;
  sideType: MissionGameSide;
  slots: number;
};

const SideInfo: FC<SideInfoProps> = ({ label, sideName, sideType, slots }) => {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <span className="text-zinc-500">{label}:</span>
        <span className={cn('font-semibold', sideTypeColors[sideType])}>{sideName}</span>
      </div>
      <div className="flex items-center gap-1">
        <UsersIcon className="size-3 text-zinc-400" />
        <span className={cn('text-xs font-medium', sideTypeColors[sideType])}>{slots}</span>
      </div>
    </div>
  );
};

export const MissionCard: FC<{ mission: Mission }> = ({ mission }) => {
  const lastVersion =
    mission?.missionVersions && mission.missionVersions.length > 0
      ? mission.missionVersions[mission.missionVersions.length - 1]
      : null;

  const totalSlots = lastVersion ? lastVersion.attackSideSlots + lastVersion.defenseSideSlots : 0;
  return (
    <Card className="group hover:border-lime-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-lime-500/10">
      <div className="flex flex-col gap-4">
        {/* Image */}
        <div className="relative w-full aspect-video overflow-hidden rounded-lg border border-white/10">
          {mission.image?.url ? (
            <Image
              src={mission.image.url}
              alt={mission.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized={!mission.image.url.startsWith('https')}
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
              <span className="text-zinc-500 text-sm">Немає зображення</span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-semibold border border-white/20 bg-black/40 text-white">
              {missionTypeLabels[mission.missionType]}
            </span>
            {mission.state === State.ARCHIVED && (
              <span className="rounded border border-zinc-500/50 bg-zinc-900/90 px-2 py-1 text-xs font-semibold text-zinc-300">
                Архів
              </span>
            )}
          </div>

          {/* Status Badge */}
          {lastVersion?.status && (
            <div className="absolute top-3 right-3">
              <span className={cn('px-2 py-1 rounded text-xs font-semibold border', statusColors[lastVersion.status])}>
                {statusLabels[lastVersion.status]}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">{mission.name}</h3>
            <MessageContent
              message={mission.description}
              textOnly
              className="mb-2 line-clamp-2 text-sm text-zinc-400 [&_p]:inline"
            />
            <MissionAuthorsText
              mission={mission}
              className="text-xs text-zinc-500"
              labelClassName="text-zinc-500"
              userClassName="text-zinc-400"
            />
            {mission.island && (
              <div className="text-xs text-zinc-500">
                <span className="text-zinc-500">Карта: </span>
                <span className="text-zinc-400">{mission.island.name}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 text-sm text-zinc-400">
              {totalSlots > 0 && (
                <div className="flex items-center gap-1.5">
                  <UsersIcon className="size-4" />
                  <span>{totalSlots} слотів</span>
                </div>
              )}
              {mission?.missionVersions?.length > 0 && (
                <div className="flex items-center gap-1.5 ml-auto">
                  <MilestoneIcon className="size-4" />
                  <span className="text-xs">
                    {mission?.missionVersions[mission?.missionVersions.length - 1]?.version}
                  </span>
                </div>
              )}
            </div>

            {/* Last Version Sides */}
            {lastVersion && (
              <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                <SideInfo
                  label="Атака"
                  sideName={lastVersion.attackSideName}
                  sideType={lastVersion.attackSideType}
                  slots={lastVersion.attackSideSlots}
                />
                <SideInfo
                  label="Оборона"
                  sideName={lastVersion.defenseSideName}
                  sideType={lastVersion.defenseSideType}
                  slots={lastVersion.defenseSideSlots}
                />
                {mission.missionType === MissionType.mini && lastVersion.minSlotsToPlay != null && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Мін. слотів для гри:</span>
                    <div className="flex items-center gap-1">
                      <UsersIcon className="size-3 text-zinc-400" />
                      <span className="text-xs font-medium text-zinc-300">{lastVersion.minSlotsToPlay}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <Link href={ROUTES.missions.id(mission.id)}>
            <Button variant="default" className="w-full">
              <EyeIcon className="size-4" />
              Переглянути
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
