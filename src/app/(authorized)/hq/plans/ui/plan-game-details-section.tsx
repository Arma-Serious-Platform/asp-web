'use client';

import { CalendarIcon } from 'lucide-react';

import { MissionImagePanel } from '@/entities/mission/mission-image-panel';
import { MissionDetails } from '@/entities/mission/mission-details';
import { Game, SideType } from '@/shared/sdk/types';

import { getGameHumanLabel } from './plan-card';

type PlanGameDetailsSectionProps = {
  selectedGame?: Game;
  attackSideType?: SideType;
  defenseSideType?: SideType;
};

export function PlanGameDetailsSection({
  selectedGame,
  attackSideType,
  defenseSideType,
}: PlanGameDetailsSectionProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Деталі гри</div>
      {selectedGame ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-lg font-bold text-zinc-100">
            <CalendarIcon className="size-5 shrink-0" />
            <span>{getGameHumanLabel(selectedGame.date, selectedGame.position)}</span>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
            <MissionImagePanel game={selectedGame} descriptionMaxLength={100} />
            <div className="lg:w-3/5">
              <MissionDetails
                game={selectedGame}
                attackSideType={attackSideType}
                defenseSideType={defenseSideType}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-zinc-500">Деталі гри недоступні</div>
      )}
    </div>
  );
}
