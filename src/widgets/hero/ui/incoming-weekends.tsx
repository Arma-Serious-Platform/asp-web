'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Link } from '@/shared/ui/atoms/link';
import { ROUTES } from '@/shared/config/routes';

import { FC, useEffect } from 'react';
import { CalendarIcon, ArrowRightIcon, MapIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { IncomingWeekendsState } from '../state/incoming-weekends.state';
import { formatGameDate } from '@/shared/utils/date';
import { cn } from '@/shared/utils/cn';
import { MissionModel } from '@/entities/mission/mission.model';

const GameFaction: FC<{
  name?: string | null;
  role: string;
  sideType?: string | null;
}> = ({ name, role, sideType }) => {
  if (!name) return null;

  const color = MissionModel.resolveMissionSideColor(sideType ?? undefined);

  return (
    <span className={cn('inline-flex min-w-0 max-w-full items-baseline gap-1', color.text)}>
      <span className="truncate font-semibold">{name}</span>
      <span className="shrink-0 font-medium opacity-75">({role})</span>
    </span>
  );
};

export const IncomingWeekends: FC<{
  model: IncomingWeekendsState;
}> = observer(({ model }) => {
  useEffect(() => {
    model.init();
  }, []);

  const upcomingGames = model.upcomingGames;

  if (upcomingGames.length === 0) {
    return null;
  }

  return (
    <div className="w-full relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-black/95 via-black/90 to-black/95" />
      <div
        className='absolute inset-0 bg-[url("/images/hero.jpg")] bg-cover bg-center bg-no-repeat opacity-10'
        style={{ backgroundAttachment: 'fixed' }}
      />
      <div className="absolute inset-0 bg-linear-to-r from-lime-700/5 via-transparent to-lime-700/5" />

      <div className="relative z-10 w-full py-4 md:py-5">
        <div className="container mx-auto px-4">
          <div className="paper rounded-lg p-3 md:p-4 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
              <div>
                <div className="mb-0.5 flex items-center gap-1.5 text-xs text-zinc-400">
                  <CalendarIcon className="size-3.5 shrink-0" />
                  <span>{model.weekend?.name ?? ''}</span>
                </div>
                <h2 className="text-lg font-bold text-white md:text-xl">Найближчі ігри</h2>
              </div>
              <Link href={model.weekend?.id ? ROUTES.weekendByAnchor(model.weekend.id) : ROUTES.weekends}>
                <Button variant="outline" size="sm" className="h-8 gap-1 px-2.5 text-xs">
                  Всі анонси
                  <ArrowRightIcon className="size-3.5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3">
              {upcomingGames.map(game => {
                const sideLabels = MissionModel.getMissionSideRoleLabels(game.mission.missionObjective);
                const weekendId = game.weekendId ?? model.weekend?.id;
                const factions = [
                  {
                    name: game.missionVersion.attackSideName,
                    role: sideLabels.attack,
                    sideType: game.missionVersion.attackSideType,
                  },
                  {
                    name: game.missionVersion.defenseSideName,
                    role: sideLabels.defense,
                    sideType: game.missionVersion.defenseSideType,
                  },
                  ...(game.missionVersion.friendlySideName
                    ? [
                        {
                          name: game.missionVersion.friendlySideName,
                          role: 'Союзники',
                          sideType: game.missionVersion.friendlySideType,
                        },
                      ]
                    : []),
                ].filter(faction => faction.name);

                return (
                  <Link
                    key={game.id}
                    href={weekendId ? ROUTES.weekendByAnchor(weekendId, game.id) : ROUTES.weekends}
                    className="group paper flex cursor-pointer items-center gap-3 rounded-md border border-white/10 p-2.5 transition-colors hover:border-lime-700/50 md:p-3">
                    <div className="relative h-20 w-34 shrink-0 overflow-hidden rounded-md border border-white/10 md:h-24 md:w-40">
                      <img
                        src={game.mission.image?.url || '/images/avatar.jpg'}
                        alt={game.mission.name ?? 'Місія'}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <h3 className="wrap-break-word text-sm font-bold leading-tight text-white md:text-base">
                        {game.mission.name ?? `Гра ${game.position + 1}`}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                        {game.date && (
                          <div className="flex items-center gap-1 text-xs text-zinc-400">
                            <CalendarIcon className="size-3 shrink-0" />
                            <span>{formatGameDate(game.date)}</span>
                          </div>
                        )}
                        {game.mission.island && (
                          <div className="flex items-center gap-1 text-xs text-zinc-400">
                            <MapIcon className="size-3 shrink-0" />
                            <span>{game.mission.island.name}</span>
                          </div>
                        )}
                      </div>

                      {factions.length > 0 && (
                        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
                          {factions.map((faction, index) => (
                            <span key={`${faction.role}-${faction.name}`} className="inline-flex min-w-0 items-center">
                              {index > 0 && <span className="mr-1.5 text-white/25">·</span>}
                              <GameFaction name={faction.name} role={faction.role} sideType={faction.sideType} />
                            </span>
                          ))}
                        </div>
                      )}
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
