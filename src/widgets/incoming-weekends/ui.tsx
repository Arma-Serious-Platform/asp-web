'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Link } from '@/shared/ui/atoms/link';
import { ROUTES } from '@/shared/config/routes';

import { FC, useEffect } from 'react';
import { CalendarIcon, ArrowRightIcon, MapIcon, ShieldIcon, ClockIcon, CloudSunIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { IncomingWeekendsModel } from './model';
import dayjs from 'dayjs';
import { cn } from '@/shared/utils/cn';
import { resolveMissionSideColor } from '@/entities/mission/mission-side-colors';
import { MessageContent } from '@/entities/comment/lexical-message';

export const IncomingWeekends: FC<{
  model: IncomingWeekendsModel;
}> = observer(({ model }) => {
  useEffect(() => {
    model.init();
  }, []);

  const upcomingGames = model.upcomingGames;

  // Return null if no future games
  if (upcomingGames.length === 0) {
    return null;
  }

  return (
    <div className="w-full relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-black/95 via-black/90 to-black/95" />
      <div
        className='absolute inset-0 bg-[url("/images/hero.jpg")] bg-cover bg-center bg-no-repeat opacity-10'
        style={{ backgroundAttachment: 'fixed' }}
      />
      <div className="absolute inset-0 bg-linear-to-r from-lime-700/5 via-transparent to-lime-700/5" />

      {/* Content */}
      <div className="relative z-10 w-full py-4 md:py-5">
        <div className="container mx-auto px-4">
          <div className="paper rounded-lg p-3 md:p-4 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
              <div>
                <div className="mb-0.5 flex items-center gap-1.5 text-xs text-zinc-400">
                  <CalendarIcon className="size-3.5 shrink-0" />
                  <span>{model.weekend?.name ?? ''}</span>
                </div>
                <h2 className="text-lg font-bold text-white md:text-xl">Найближчі ігри</h2>
              </div>
              <Link href={ROUTES.weekends}>
                <Button variant="outline" size="sm" className="h-8 gap-1 px-2.5 text-xs">
                  Всі анонси
                  <ArrowRightIcon className="size-3.5" />
                </Button>
              </Link>
            </div>

            {/* Games Preview */}
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3">
              {upcomingGames.map(game => {
                const attackColor = resolveMissionSideColor(game.missionVersion.attackSideType);
                const defenseColor = resolveMissionSideColor(game.missionVersion.defenseSideType);

                return (
                  <Link
                    key={game.id}
                    href={ROUTES.weekends}
                    className="paper cursor-pointer rounded-md border border-white/10 p-2.5 transition-colors hover:border-lime-700/50 md:p-3">
                    <div className="flex items-start gap-2">
                      {/* Mission Image */}
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-white/10 md:size-18">
                        <img
                          src={game.mission.image?.url || '/images/avatar.jpg'}
                          alt={game.mission.name ?? 'Місія'}
                          className="size-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                      </div>

                      {/* Game Info */}
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <h3 className="wrap-break-word text-sm font-bold leading-tight text-white md:text-base">
                          {game.mission.name ?? `Гра ${game.position + 1}`}
                        </h3>

                        {/* Date and Island */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          {game.date && (
                            <div className="flex items-center gap-1 text-xs text-zinc-400">
                              <CalendarIcon className="size-3 shrink-0" />
                              <span>{dayjs(game.date).format('DD.MM.YYYY')}</span>
                            </div>
                          )}
                          {game.mission.island && (
                            <div className="flex items-center gap-1 text-xs text-zinc-400">
                              <MapIcon className="size-3 shrink-0" />
                              <span>{game.mission.island.name}</span>
                            </div>
                          )}
                          {game.missionVersion.inGameTime && (
                            <div className="flex items-center gap-1 text-xs text-zinc-400">
                              <ClockIcon className="size-3 shrink-0" />
                              <span>{dayjs(game.missionVersion.inGameTime).format('HH:mm')}</span>
                            </div>
                          )}
                          {game.missionVersion.weather && (
                            <div className="flex items-center gap-1 text-xs text-zinc-400">
                              <CloudSunIcon className="size-3 shrink-0" />
                              <span>{game.missionVersion.weather}</span>
                            </div>
                          )}
                        </div>

                        {/* Sides — same pattern as MissionDetails combatants */}
                        <div className="rounded-md border border-white/10 bg-black/35 px-2 py-1.5">
                          <div className="mb-1 flex items-center gap-1.5">
                            <ShieldIcon className="size-3 shrink-0 text-lime-500" />
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                              Сторони конфлікту
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                            <div className="flex min-w-0 items-center gap-1">
                              <div className={cn('size-1.5 shrink-0 rounded-full', attackColor.dot)} />
                              <span className={cn('truncate text-xs font-semibold', attackColor.text)}>
                                {game.missionVersion.attackSideName}
                              </span>
                              <span className="shrink-0 text-[11px] text-zinc-500">
                                ({game.missionVersion.attackSideSlots})
                              </span>
                              <span
                                className={cn(
                                  'shrink-0 rounded px-1.5 py-px text-[10px] font-semibold leading-none',
                                  attackColor.soft,
                                )}>
                                Атака
                              </span>
                            </div>
                            <span className="shrink-0 text-[11px] font-bold text-zinc-500">vs</span>
                            <div className="flex min-w-0 items-center gap-1">
                              <div className={cn('size-1.5 shrink-0 rounded-full', defenseColor.dot)} />
                              <span className={cn('truncate text-xs font-semibold', defenseColor.text)}>
                                {game.missionVersion.defenseSideName}
                              </span>
                              <span className="shrink-0 text-[11px] text-zinc-500">
                                ({game.missionVersion.defenseSideSlots})
                              </span>
                              <span
                                className={cn(
                                  'shrink-0 rounded px-1.5 py-px text-[10px] font-semibold leading-none',
                                  defenseColor.soft,
                                )}>
                                Оборона
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Mission Description */}
                        {game.mission.description && (
                          <MessageContent
                            message={game.mission.description}
                            textOnly
                            className="line-clamp-2 text-[11px] leading-snug text-zinc-400 [&_p]:inline"
                          />
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
