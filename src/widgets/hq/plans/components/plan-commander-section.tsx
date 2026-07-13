'use client';

import toast from 'react-hot-toast';

import { UserNicknameText } from '@/entities/user/ui/user-text';
import { HeadquartersGamePlan } from '@/shared/sdk/types';
import { Avatar } from '@/shared/ui/organisms/avatar';
import { Button } from '@/shared/ui/atoms/button';

import { HqPlansModel } from '../model';

type PlanCommanderSectionProps = {
  model: HqPlansModel;
  selectedPlan: HeadquartersGamePlan;
  selectedCommander?: HeadquartersGamePlan['gameCommander'];
  isCommander: boolean;
  isHqAdmin: boolean;
  canManageHqSquad: boolean;
  isInHqSquad: boolean;
};

export function PlanCommanderSection({
  model,
  selectedPlan,
  selectedCommander,
  isCommander,
  isHqAdmin,
  canManageHqSquad,
  isInHqSquad,
}: PlanCommanderSectionProps) {
  const canAssignSelf =
    !selectedPlan.gameCommanderId && Boolean(selectedPlan.hqSquadId) && isInHqSquad && canManageHqSquad;

  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Командир</div>
      <div className="flex flex-wrap items-center gap-2">
        {selectedCommander ? (
          <div className="flex items-center gap-2">
            <Avatar
              size="sm"
              toProfileId={selectedCommander.id}
              src={selectedCommander.avatar?.url ?? undefined}
              alt={selectedCommander.nickname}
            />
            <span className="text-sm">
              <UserNicknameText user={selectedCommander} />
            </span>
          </div>
        ) : (
          <span className="text-sm text-zinc-200">Не призначено</span>
        )}
        {canAssignSelf && (
          <Button
            size="sm"
            onClick={async () => {
              try {
                await model.assignCommander(selectedPlan.id);
              } catch (error) {
                console.error(error);
                toast.error('Не вдалося призначити командира');
              }
            }}>
            Призначити себе
          </Button>
        )}
        {!selectedPlan.hqSquadId && canManageHqSquad && !selectedPlan.gameCommanderId && (
          <span className="text-xs text-zinc-500">Спочатку призначте штабний загін</span>
        )}
        {selectedPlan.gameCommanderId && (isCommander || isHqAdmin) && (
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                await model.unassignCommander(selectedPlan.id);
              } catch (error) {
                console.error(error);
                toast.error('Не вдалося зняти командира');
              }
            }}>
            Зняти командира
          </Button>
        )}
      </div>
    </div>
  );
}
