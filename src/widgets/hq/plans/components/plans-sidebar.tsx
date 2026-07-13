'use client';

import { observer } from 'mobx-react-lite';

import { HeadquartersGamePlan } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';

import { HqPlansModel } from '../model';
import { PlanCard } from './plan-card';
import { PlanListSkeleton } from './plan-list-skeleton';

type PlansSidebarProps = {
  model: HqPlansModel;
  activePlanId?: string;
};

function PlansSection({
  title,
  plans,
  model,
  activePlanId,
}: {
  title: string;
  plans: HeadquartersGamePlan[];
  model: HqPlansModel;
  activePlanId?: string;
}) {
  if (plans.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{title}</div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {plans.map(plan => {
          const game = model.gamesById[plan.gameId];
          const attackSideType = model.sidesById[game?.attackSideId || '']?.type;
          const defenseSideType = model.sidesById[game?.defenseSideId || '']?.type;

          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              activePlanId={activePlanId}
              game={game}
              attackSideType={attackSideType}
              defenseSideType={defenseSideType}
              attackSideName={model.sidesById[game?.attackSideId || '']?.name}
              defenseSideName={model.sidesById[game?.defenseSideId || '']?.name}
              commander={
                plan.gameCommander ?? (plan.gameCommanderId ? model.usersById[plan.gameCommanderId] : null)
              }
            />
          );
        })}
      </div>
    </div>
  );
}

export const PlansSidebar = observer(({ model, activePlanId }: PlansSidebarProps) => {
  return (
    <aside className="overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-2">
      <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Список планів</div>

      {model.isLoading ? (
        <PlanListSkeleton />
      ) : !model.hasAnyPlans ? (
        <div className="px-2 py-2 text-sm text-zinc-500">Плани не знайдено</div>
      ) : (
        <div className="flex flex-col gap-4">
          <PlansSection title="Сьогодні" plans={model.todayPlans} model={model} activePlanId={activePlanId} />
          <PlansSection title="Майбутні" plans={model.futurePlans} model={model} activePlanId={activePlanId} />

          {model.archivePlans.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Архів</div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {model.visibleArchivePlans.map(plan => {
                  const game = model.gamesById[plan.gameId];
                  const attackSideType = model.sidesById[game?.attackSideId || '']?.type;
                  const defenseSideType = model.sidesById[game?.defenseSideId || '']?.type;

                  return (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      activePlanId={activePlanId}
                      game={game}
                      attackSideType={attackSideType}
                      defenseSideType={defenseSideType}
                      attackSideName={model.sidesById[game?.attackSideId || '']?.name}
                      defenseSideName={model.sidesById[game?.defenseSideId || '']?.name}
                      commander={
                plan.gameCommander ?? (plan.gameCommanderId ? model.usersById[plan.gameCommanderId] : null)
              }
                    />
                  );
                })}
              </div>
              {model.hasMoreArchivePlans && (
                <Button size="sm" variant="outline" className="mx-2 w-fit" onClick={() => model.loadMoreArchivePlans()}>
                  Завантажити ще
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
});
