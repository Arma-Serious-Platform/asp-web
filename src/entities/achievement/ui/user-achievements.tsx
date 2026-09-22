'use client';

import { FC } from 'react';
import Image from 'next/image';

import { Achievement } from '@/shared/sdk/types';
import { cn } from '@/shared/utils/cn';
import { Tooltip } from '@/shared/ui/moleculas/tooltip';

type UserAchievementsProps = {
  achievements?: Achievement[] | null;
  className?: string;
};

export const UserAchievements: FC<UserAchievementsProps> = ({ achievements, className }) => {
  if (!achievements?.length) return null;

  return (
    <div className={cn('flex w-full flex-wrap gap-2', className)}>
      {achievements.map(achievement => {
        const iconUrl = achievement.icon?.url;

        return (
          <Tooltip
            key={achievement.id}
            trigger={
              <span className="flex size-10 shrink-0 cursor-default items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/60">
                {iconUrl ? (
                  <Image
                    src={iconUrl}
                    alt={achievement.title}
                    width={40}
                    height={40}
                    className="size-10 object-cover"
                    unoptimized={!iconUrl.startsWith('https')}
                  />
                ) : (
                  <span className="text-[10px] text-zinc-500">?</span>
                )}
              </span>
            }>
            <div className="max-w-56 space-y-1">
              <p className="text-sm font-semibold text-zinc-100">{achievement.title}</p>
              <p className="text-xs text-zinc-400">{achievement.description}</p>
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
};

export const AchievementOptionContent: FC<{ achievement: Achievement }> = ({ achievement }) => {
  const iconUrl = achievement.icon?.url;

  return (
    <span className="flex min-w-0 items-center gap-2">
      {iconUrl ? (
        <Image
          src={iconUrl}
          alt=""
          width={18}
          height={18}
          className="size-4 rounded object-cover"
          unoptimized={!iconUrl.startsWith('https')}
        />
      ) : (
        <span className="size-2 rounded-full bg-lime-500" aria-hidden />
      )}
      <span className="truncate">{achievement.title}</span>
    </span>
  );
};
