'use client';

import { FC } from 'react';
import { CalendarIcon, CloudSunIcon, ClockIcon, MapIcon } from 'lucide-react';
import dayjs from 'dayjs';

import { Game } from '@/shared/sdk/types';
import { MissionModel } from '@/entities/mission/mission.model';
import { UserNicknameText } from '@/entities/user/ui/user-text';
import { SquadSideBadge } from '@/entities/side/ui/squad-side-badge';
import { TooltipContent, TooltipPrimitive, TooltipProvider, TooltipTrigger } from '@/shared/ui/moleculas/tooltip';
import { formatGameDate } from '@/shared/utils/date';
import { cn } from '@/shared/utils/cn';

const FactionLine: FC<{
  role: string;
  name?: string | null;
  sideType?: string | null;
  slots?: number | null;
  squadName?: string | null;
  squadType?: string | null;
}> = ({ role, name, sideType, slots, squadName, squadType }) => {
  if (!name) return null;

  const color = MissionModel.resolveMissionSideColor(sideType ?? undefined);

  return (
    <div className="flex min-w-0 flex-col items-start gap-1">
      <SquadSideBadge name={squadName} type={squadType} size="compact" />
      <div className="flex min-w-0 items-center gap-1.5">
        <span className={cn('size-1.5 shrink-0 rounded-full', color.dot)} />
        <span className={cn('truncate font-semibold', color.text)}>{name}</span>
        {typeof slots === 'number' && <span className={cn('shrink-0', color.text)}>({slots})</span>}
        <span className="shrink-0 text-zinc-400">— {role}</span>
      </div>
    </div>
  );
};

const GameDetails: FC<{ game: Game }> = ({ game }) => {
  const version = game.missionVersion ?? {};
  const mission = game.mission ?? {};
  const sideLabels = MissionModel.getMissionSideRoleLabels(mission.missionObjective);
  const objectiveLabel = mission.missionObjective
    ? MissionModel.missionObjectiveLabels[mission.missionObjective]
    : null;
  const allySideLabel = version.friendlyTo === version.attackSideType ? sideLabels.attack : sideLabels.defense;

  return (
    <div className="flex w-full flex-col gap-2 text-left">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-white">{mission.name ?? `Гра ${game.position + 1}`}</span>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-400">
          {game.date && (
            <span className="flex items-center gap-1">
              <CalendarIcon className="size-3 shrink-0" />
              {formatGameDate(game.date)}
            </span>
          )}
          {mission.island?.name && (
            <span className="flex items-center gap-1">
              <MapIcon className="size-3 shrink-0" />
              {mission.island.name}
            </span>
          )}
          {version.inGameTime && (
            <span className="flex items-center gap-1">
              <ClockIcon className="size-3 shrink-0" />
              {dayjs(version.inGameTime).format('HH:mm')}
            </span>
          )}
          {version.weather && (
            <span className="flex items-center gap-1">
              <CloudSunIcon className="size-3 shrink-0" />
              {version.weather}
            </span>
          )}
        </div>
      </div>

      {objectiveLabel && (
        <span className="w-fit rounded border border-lime-500/40 bg-lime-950/40 px-1.5 py-0.5 text-[10px] font-semibold text-lime-200">
          {objectiveLabel}
        </span>
      )}

      <div className="flex flex-col gap-2 border-t border-white/10 pt-2">
        <FactionLine
          role={sideLabels.attack}
          name={version.attackSideName}
          sideType={version.attackSideType}
          slots={version.attackSideSlots}
          squadName={game.attackSide?.name}
          squadType={game.attackSide?.type}
        />
        <FactionLine
          role={sideLabels.defense}
          name={version.defenseSideName}
          sideType={version.defenseSideType}
          slots={version.defenseSideSlots}
          squadName={game.defenseSide?.name}
          squadType={game.defenseSide?.type}
        />
        <FactionLine
          role={`союзник (${allySideLabel})`}
          name={version.friendlySideName}
          sideType={version.friendlySideType}
          slots={version.friendlySideSlots}
        />
      </div>

      <div className="border-t border-white/10 pt-2 text-[11px] text-zinc-400">
        Адміністратор:{' '}
        {game.admin ? (
          <UserNicknameText user={game.admin} link={false} className="text-zinc-200" />
        ) : (
          <span className="text-zinc-500">не призначений</span>
        )}
      </div>
    </div>
  );
};

const GameRow: FC<{ game: Game }> = ({ game }) => {
  const imageUrl = game.mission?.image?.url;
  const missionName = game.mission?.name ?? `Гра ${game.position + 1}`;

  return (
    <TooltipPrimitive>
      <TooltipTrigger
        closeOnClick={false}
        render={props => (
          <div
            {...props}
            className={cn(
              'flex min-w-40 max-w-48 cursor-default items-center gap-2 rounded px-1 py-0.5 text-left transition-colors hover:bg-white/5',
              props.className,
            )}>
            <div className="relative size-9 shrink-0 overflow-hidden rounded border border-white/10 bg-black/40">
              <img
                src={imageUrl || '/images/logo.webp'}
                alt={missionName}
                className={cn('size-full', imageUrl ? 'object-cover' : 'object-contain p-0.5')}
              />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm text-zinc-100">{missionName}</span>
              <span className="truncate text-xs text-zinc-400">
                {game.admin ? <UserNicknameText user={game.admin} link={false} /> : 'Адмін не призначений'}
              </span>
            </div>
          </div>
        )}
      />
      <TooltipContent side="left" align="start" className="flex max-w-80 flex-col items-stretch p-3">
        <GameDetails game={game} />
      </TooltipContent>
    </TooltipPrimitive>
  );
};

export const WeekendGamesCell: FC<{ games?: Game[] | null }> = ({ games }) => {
  if (!games?.length) {
    return <div className="text-zinc-500">—</div>;
  }

  const sortedGames = [...games].sort((a, b) => a.position - b.position);

  return (
    <TooltipProvider delay={250}>
      <div className="flex max-w-full flex-row flex-wrap gap-1 whitespace-normal">
        {sortedGames.map(game => (
          <GameRow key={game.id} game={game} />
        ))}
      </div>
    </TooltipProvider>
  );
};
