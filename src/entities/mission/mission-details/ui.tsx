import { FC } from 'react';

import { CarIcon, UsersIcon, CalendarIcon, ShieldIcon } from 'lucide-react';
import { Card } from '@/shared/ui/atoms/card';
import classNames from 'classnames';
import { Game, MissionGameSide, SideType } from '@/shared/sdk/types';
import dayjs from 'dayjs';

export const MissionDetails: FC<{ game: Game }> = ({ game }) => {
  return (
    <div className="flex flex-col gap-5">
      {/* Header Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-3xl font-bold text-white leading-tight">{game.mission.name}</h2>
        </div>
        {game.date && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <CalendarIcon className="size-4" />
            <span>{dayjs(game.date).format('DD.MM.YYYY')}</span>
          </div>
        )}
      </div>

      {/* Combatants Card */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <ShieldIcon className="size-4 text-lime-500" />
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Сторони конфлікту</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div
              className={classNames('w-2 h-2 rounded-full', {
                'bg-red-500': game.missionVersion.attackSideType === MissionGameSide.RED,
                'bg-blue-500': game.missionVersion.attackSideType === MissionGameSide.BLUE,
              })}
            />
            <span
              className={classNames('font-bold text-base', {
                'text-red-500': game.missionVersion.attackSideType === MissionGameSide.RED,
                'text-blue-500': game.missionVersion.attackSideType === MissionGameSide.BLUE,
              })}>
              {game.missionVersion.attackSideName}
            </span>
            <span className="text-zinc-500 text-sm">({game.missionVersion.attackSideSlots})</span>
            <span
              className={classNames('px-2 py-0.5 rounded text-xs font-semibold', {
                'bg-red-500/20 text-red-400': game.missionVersion.attackSideType === MissionGameSide.RED,
                'bg-blue-500/20 text-blue-400': game.missionVersion.attackSideType === MissionGameSide.BLUE,
              })}>
              {game.missionVersion.attackSideType === MissionGameSide.RED ? 'Атака' : 'Оборона'}
            </span>
          </div>
          <span className="text-zinc-500 font-bold">vs</span>
          <div className="flex items-center gap-2">
            <div
              className={classNames('w-2 h-2 rounded-full', {
                'bg-red-500': game.missionVersion.defenseSideType === MissionGameSide.RED,
                'bg-blue-500': game.missionVersion.defenseSideType === MissionGameSide.BLUE,
              })}
            />
            <span
              className={classNames('font-bold text-base', {
                'text-red-500': game.missionVersion.defenseSideType === MissionGameSide.RED,
                'text-blue-500': game.missionVersion.defenseSideType === MissionGameSide.BLUE,
              })}>
              {game.missionVersion.defenseSideName}
            </span>
            <span className="text-zinc-500 text-sm">({game.missionVersion.defenseSideSlots})</span>
            <span
              className={classNames('px-2 py-0.5 rounded text-xs font-semibold', {
                'bg-red-500/20 text-red-400': game.missionVersion.defenseSideType === MissionGameSide.RED,
                'bg-blue-500/20 text-blue-400': game.missionVersion.defenseSideType === MissionGameSide.BLUE,
              })}>
              {game.missionVersion.defenseSideType === MissionGameSide.RED ? 'Атака' : 'Оборона'}
            </span>
          </div>
        </div>
      </Card>

      {/* Units Card */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <CarIcon className="size-4 text-lime-500" />
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Техніка та озброєння</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Side 1 Units */}
          <div className="flex flex-col gap-2.5">
            <div
              className={classNames('text-xs font-semibold uppercase tracking-wide mb-2 pb-2 border-b', {
                'text-red-400 border-red-500/30': game.missionVersion.attackSideType === MissionGameSide.RED,
                'text-blue-400 border-blue-500/30': game.missionVersion.attackSideType === MissionGameSide.BLUE,
              })}>
              {game.missionVersion.attackSideName}
            </div>
            {game.missionVersion.weaponry?.map((unit, idx) => (
              <div key={idx}>{unit.name}</div>
            ))}
          </div>

          {/* Side 2 Units */}
          <div className="flex flex-col gap-2.5">
            <div
              className={classNames('text-xs font-semibold uppercase tracking-wide mb-2 pb-2 border-b', {
                'text-red-400 border-red-500/30': game.missionVersion.defenseSideType === MissionGameSide.RED,
                'text-blue-400 border-blue-500/30': game.missionVersion.defenseSideType === MissionGameSide.BLUE,
              })}>
              {game.missionVersion.defenseSideName}
            </div>
            {game.missionVersion.weaponry?.map((unit, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm py-1 group hover:bg-white/5 rounded px-2 -mx-2 transition-colors">
                <div className="flex-1 min-w-0">
                  <span className="text-white">{unit.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
