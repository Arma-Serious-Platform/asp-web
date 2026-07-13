'use client';

import { observer } from 'mobx-react-lite';

import { DeleteMissionCommentModel } from '@/features/mission/comment/delete-comment';
import { Game, HeadquartersComment, HeadquartersGamePlan, Side, User } from '@/shared/sdk/types';

import { HqPlansModel } from '../model';
import { PlanCommanderSection } from './plan-commander-section';
import { PlanCommentsSection } from './plan-comments-section';
import { PlanGameDetailsSection } from './plan-game-details-section';
import { PlanHqSquadSection } from './plan-hq-squad-section';
import { PlanSlotsSection } from './plan-slots-section';
import { PlanUrlSection } from './plan-url-section';

type PlanDetailsPanelProps = {
  model: HqPlansModel;
  selectedPlan: HeadquartersGamePlan;
  selectedCommander?: HeadquartersGamePlan['gameCommander'];
  selectedGame?: Game;
  attackSide?: Side;
  defenseSide?: Side;
  currentSquad?: User['squad'];
  currentUserId?: string;
  isHqAdmin: boolean;
  canManageHqSquad: boolean;
  isInHqSquad: boolean;
  canUnassignHqSquad: boolean;
  isCommander: boolean;
  canEditCommanderFields: boolean;
  currentSide?: Side['type'];
  deleteHqCommentModel: DeleteMissionCommentModel;
};

export const PlanDetailsPanel = observer(
  ({
    model,
    selectedPlan,
    selectedCommander,
    selectedGame,
    attackSide,
    defenseSide,
    currentSquad,
    currentUserId,
    isHqAdmin,
    canManageHqSquad,
    isInHqSquad,
    canUnassignHqSquad,
    isCommander,
    canEditCommanderFields,
    currentSide,
    deleteHqCommentModel,
  }: PlanDetailsPanelProps) => {
    const canDeleteHeadquartersComment = (comment: HeadquartersComment) =>
      isHqAdmin || Boolean(currentUserId && comment.userId === currentUserId);

    return (
      <div className="flex flex-col gap-4">
        <PlanGameDetailsSection
          selectedPlan={selectedPlan}
          selectedGame={selectedGame}
          attackSide={attackSide}
          defenseSide={defenseSide}
        />
        <PlanHqSquadSection
          model={model}
          selectedPlan={selectedPlan}
          canManageHqSquad={canManageHqSquad}
          canUnassignHqSquad={canUnassignHqSquad}
        />
        <PlanCommanderSection
          model={model}
          selectedPlan={selectedPlan}
          selectedCommander={selectedCommander}
          isCommander={isCommander}
          isHqAdmin={isHqAdmin}
          canManageHqSquad={canManageHqSquad}
          isInHqSquad={isInHqSquad}
        />
        <PlanUrlSection model={model} selectedPlan={selectedPlan} canEditCommanderFields={canEditCommanderFields} />
        <PlanSlotsSection
          model={model}
          selectedPlan={selectedPlan}
          currentSquad={currentSquad}
          canEditCommanderFields={canEditCommanderFields}
          squadOptions={model.getSquadOptions(currentSide)}
        />
        <PlanCommentsSection
          model={model}
          selectedPlanId={selectedPlan.id}
          deleteHqCommentModel={deleteHqCommentModel}
          canDeleteHeadquartersComment={canDeleteHeadquartersComment}
        />
      </div>
    );
  },
);
