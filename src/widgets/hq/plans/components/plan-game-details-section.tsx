'use client';

import { observer } from 'mobx-react-lite';
import toast from 'react-hot-toast';

import { MissionImagePanel } from '@/entities/mission/mission-image-panel/ui';
import { MissionDetails } from '@/entities/mission/mission-details/ui';
import { Game, HeadquartersGamePlan, Side } from '@/shared/sdk/types';

import { getGameHumanLabel } from '../lib';

type PlanGameDetailsSectionProps = {
  selectedPlan: HeadquartersGamePlan;
  selectedGame?: Game;
  attackSide?: Side;
  defenseSide?: Side;
};

export function PlanGameDetailsSection({ selectedPlan, selectedGame, attackSide, defenseSide }: PlanGameDetailsSectionProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Деталі гри</div>
      {selectedGame ? (
        <div className="flex flex-col gap-3">
          <div className="text-sm text-zinc-300">
            {getGameHumanLabel(selectedGame.date, selectedGame.position ?? selectedPlan.game?.position)}
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
            <MissionImagePanel game={selectedGame} />
            <div className="lg:w-3/5">
              <MissionDetails
                game={selectedGame}
                attackSideType={attackSide?.type}
                defenseSideType={defenseSide?.type}
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
