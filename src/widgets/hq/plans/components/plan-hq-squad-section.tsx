'use client';

import Image from 'next/image';
import toast from 'react-hot-toast';

import { HeadquartersGamePlan } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';

import { HqPlansModel } from '../model';

type PlanHqSquadSectionProps = {
  model: HqPlansModel;
  selectedPlan: HeadquartersGamePlan;
  canManageHqSquad: boolean;
  canUnassignHqSquad: boolean;
};

export function PlanHqSquadSection({
  model,
  selectedPlan,
  canManageHqSquad,
  canUnassignHqSquad,
}: PlanHqSquadSectionProps) {
  const hqSquad = selectedPlan.hqSquad;
  const hqSquadLogoUrl =
    hqSquad?.logo?.url || (hqSquad?.id ? model.squadsById[hqSquad.id]?.logo?.url : undefined);

  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Штабний загін</div>
      <div className="flex flex-wrap items-center gap-2">
        {hqSquad ? (
          <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-black/30 px-2 py-1">
            <Image
              src={hqSquadLogoUrl || '/images/avatar.jpg'}
              width={16}
              height={16}
              alt={hqSquad.tag}
              className="size-4 rounded-full object-cover"
              unoptimized={!hqSquadLogoUrl?.startsWith('https')}
            />
            <span className="text-sm text-zinc-200">{hqSquad.tag}</span>
          </div>
        ) : (
          <span className="text-sm text-zinc-200">Не призначено</span>
        )}
        {!selectedPlan.hqSquadId && canManageHqSquad && (
          <Button
            size="sm"
            onClick={async () => {
              try {
                await model.assignHqSquad(selectedPlan.id);
              } catch (error) {
                console.error(error);
                toast.error('Не вдалося призначити штабний загін');
              }
            }}>
            Призначити свій загін
          </Button>
        )}
        {selectedPlan.hqSquadId && canUnassignHqSquad && (
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                await model.unassignHqSquad(selectedPlan.id);
              } catch (error) {
                console.error(error);
                toast.error('Не вдалося зняти штабний загін');
              }
            }}>
            Зняти штабний загін
          </Button>
        )}
      </div>
    </div>
  );
}
