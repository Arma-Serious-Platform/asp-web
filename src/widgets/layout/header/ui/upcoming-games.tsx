'use client';

import { Popover } from '@base-ui/react/popover';
import { ArrowRightIcon, CalendarClockIcon, ChevronDownIcon, MapIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import NextLink from 'next/link';
import { FC, useEffect } from 'react';

import { MissionModel } from '@/entities/mission/mission.model';
import { SquadSideBadge } from '@/entities/side/ui/squad-side-badge';
import { ROUTES } from '@/shared/config/routes';
import { Game } from '@/shared/sdk/types';
import { cn } from '@/shared/utils/cn';
import { formatGameDate } from '@/shared/utils/date';

import { upcomingGamesState, UpcomingGamesState } from '../state/upcoming-games.state';

const DESKTOP_QUERY = '(min-width: 1280px)';

const GameFactions: FC<{ game: Game }> = ({ game }) => {
  const labels = MissionModel.getMissionSideRoleLabels(game.mission.missionObjective);
  const factions = [
    {
      name: game.missionVersion.attackSideName,
      role: labels.attack,
      sideType: game.missionVersion.attackSideType,
      squadName: game.attackSide?.name,
      squadType: game.attackSide?.type,
    },
    {
      name: game.missionVersion.defenseSideName,
      role: labels.defense,
      sideType: game.missionVersion.defenseSideType,
      squadName: game.defenseSide?.name,
      squadType: game.defenseSide?.type,
    },
    {
      name: game.missionVersion.friendlySideName,
      role: 'Союзники',
      sideType: game.missionVersion.friendlySideType,
      squadName: undefined,
      squadType: undefined,
    },
  ].filter(faction => faction.name);

  if (factions.length === 0) return null;

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
      {factions.map((faction, index) => {
        const color = MissionModel.resolveMissionSideColor(faction.sideType ?? undefined);

        return (
          <span key={`${faction.role}-${faction.name}`} className="inline-flex min-w-0 items-center">
            {index > 0 && <span className="mr-1.5 text-white/25">·</span>}
            <span className="inline-flex min-w-0 max-w-full flex-col items-start gap-0.5">
              <SquadSideBadge name={faction.squadName} type={faction.squadType} size="compact" />
              <span className={cn('inline-flex min-w-0 max-w-full items-baseline gap-1', color.text)}>
                <span className="truncate font-semibold">{faction.name}</span>
                <span className="shrink-0 font-medium opacity-75">({faction.role})</span>
              </span>
            </span>
          </span>
        );
      })}
    </div>
  );
};

const GameItem: FC<{ game: Game; weekendId?: string }> = ({ game, weekendId }) => (
  <NextLink
    href={weekendId ? ROUTES.weekendByAnchor(weekendId, game.id) : ROUTES.weekends}
    className="group flex items-center gap-3 rounded-md border border-white/10 bg-black/40 p-2 transition-colors hover:border-lime-700/50 hover:text-inherit">
    <div className="h-16 w-28 shrink-0 overflow-hidden rounded-md border border-white/10 bg-black/40">
      <img
        width={112}
        height={64}
        loading="lazy"
        src={game.mission.image?.url || '/images/logo.webp'}
        alt={game.mission.name ?? 'Місія'}
        className={cn(
          'size-full',
          game.mission.image?.url
            ? 'object-cover transition-transform duration-300 group-hover:scale-105'
            : 'object-contain p-2',
        )}
      />
    </div>

    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="flex flex-wrap items-center gap-1.5 text-sm font-bold leading-tight text-white">
        <span className="wrap-break-word">{game.mission.name ?? `Гра ${game.position + 1}`}</span>
        {game.missionVersion?.version && (
          <span className="shrink-0 rounded border border-lime-500/40 bg-lime-950/40 px-1.5 py-0.5 text-[10px] font-semibold text-lime-200">
            {game.missionVersion.version}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-zinc-400">
        {game.date && <span>{formatGameDate(game.date, 'dd, DD.MM')}</span>}
        {game.mission.island && (
          <span className="flex items-center gap-1">
            <MapIcon className="size-3 shrink-0" />
            {game.mission.island.name}
          </span>
        )}
      </div>

      <GameFactions game={game} />
    </div>
  </NextLink>
);

/** Кнопка "Найближчі ігри" у верхній панелі хедера (десктоп) зі списком ігор при наведенні. */
export const UpcomingGames: FC<{ className?: string; state?: UpcomingGamesState }> = observer(
  ({ className, state = upcomingGamesState }) => {
    useEffect(() => {
      // Верхня панель видима лише на десктопі — на мобільних не робимо зайвий запит.
      if (window.matchMedia(DESKTOP_QUERY).matches) {
        void state.init();
      }
    }, [state]);

    const games = state.upcomingGames;

    if (state.isLoaded && games.length === 0) {
      return null;
    }

    const nextGame = games[0];

    return (
      <Popover.Root>
        <Popover.Trigger
          openOnHover
          delay={100}
          closeDelay={150}
          className={cn(
            'group flex cursor-pointer items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 outline-hidden transition-colors hover:text-white data-popup-open:text-white',
            className,
          )}>
          <CalendarClockIcon className="size-4 shrink-0" />
          <span className="whitespace-nowrap">Найближчі ігри</span>
          {/* Слот дати фіксованої ширини: skeleton до завантаження, щоб текст кнопки не зсувався (CLS) */}
          <span className="inline-flex w-[5ch] shrink-0 items-center">
            {state.isLoaded ? (
              nextGame?.date && (
                <span className="whitespace-nowrap text-primary normal-case tracking-normal tabular-nums">
                  {formatGameDate(nextGame.date, 'DD.MM')}
                </span>
              )
            ) : (
              <span aria-hidden className="h-3 w-full animate-pulse rounded-sm bg-white/10" />
            )}
          </span>
          <ChevronDownIcon className="size-3 transition-transform duration-200 group-data-popup-open:rotate-180" />
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Positioner side="bottom" align="end" sideOffset={8} className="z-60">
            <Popover.Popup className="paper w-104 origin-(--transform-origin) rounded-xl bg-neutral-950/90 p-3 shadow-xl outline-hidden transition-[opacity,transform] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white">Найближчі ігри</div>
                  {state.weekend?.name && (
                    <div className="truncate text-[11px] text-zinc-400">{state.weekend.name}</div>
                  )}
                </div>
                <NextLink
                  href={state.weekend?.id ? ROUTES.weekendByAnchor(state.weekend.id) : ROUTES.weekends}
                  className="flex shrink-0 items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs text-zinc-200 transition-colors hover:bg-white/5">
                  Всі анонси
                  <ArrowRightIcon className="size-3.5" />
                </NextLink>
              </div>

              {!state.isLoaded ? (
                <div className="flex flex-col gap-2">
                  {[0, 1].map(index => (
                    <div key={index} className="h-[82px] animate-pulse rounded-md border border-white/10 bg-white/5" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {games.map(game => (
                    <GameItem key={game.id} game={game} weekendId={game.weekendId ?? state.weekend?.id} />
                  ))}
                </div>
              )}
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    );
  },
);
