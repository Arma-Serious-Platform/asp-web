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
    <div className="flex flex-col gap-1.5">
      <div className="px-2 text-lg font-bold text-zinc-100">{title}</div>
      <div className="flex flex-col gap-1">
        {plans.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            activePlanId={activePlanId}
            game={model.gamesById[plan.gameId]}
            commander={plan.gameCommander ?? (plan.gameCommanderId ? model.usersById[plan.gameCommanderId] : null)}
          />
        ))}
      </div>
    </div>
  );
}

export const PlansSidebar = observer(({ model, activePlanId }: PlansSidebarProps) => {
  return (
    <aside className="flex max-h-[320px] min-h-0 flex-col self-stretch overflow-y-auto rounded-lg border border-white/10 bg-black/40 p-2 lg:max-h-none">
      <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Список планів</div>

      {model.isLoading ? (
        <PlanListSkeleton />
      ) : !model.hasAnyPlans ? (
        <div className="px-2 py-2 text-sm text-zinc-500">Плани не знайдено</div>
      ) : (
        <div className="flex flex-col gap-4">
          <PlansSection title="Сьогодні" plans={model.todayPlans} model={model} activePlanId={activePlanId} />
          <PlansSection title="Завтра" plans={model.tomorrowPlans} model={model} activePlanId={activePlanId} />
          <PlansSection title="Майбутні" plans={model.futurePlans} model={model} activePlanId={activePlanId} />

          {model.archivePlans.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="px-2 text-lg font-bold text-zinc-100">Архів</div>
              <div className="flex flex-col gap-1">
                {model.visibleArchivePlans.map(plan => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    activePlanId={activePlanId}
                    game={model.gamesById[plan.gameId]}
                    commander={
                      plan.gameCommander ?? (plan.gameCommanderId ? model.usersById[plan.gameCommanderId] : null)
                    }
                  />
                ))}
              </div>
              {model.hasMoreArchivePlans && (
                <Button size="sm" variant="outline" className="mx-2 mt-1 w-fit" onClick={() => model.loadMoreArchivePlans()}>
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
