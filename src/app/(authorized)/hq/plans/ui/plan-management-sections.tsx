'use client';

import { observer } from 'mobx-react-lite';

import { DeleteMissionCommentState } from '@/app/missions/[id]/state/delete-comment.state';
import { Game, HeadquartersComment, HeadquartersGamePlan, Side, User } from '@/shared/sdk/types';
import { session } from '@/entities/session/session.state';

import { HqPlansState } from '../state/hq-plans.state';
import { PlanCommanderSection } from './plan-commander-section';
import { PlanCommentsSection } from './plan-comments-section';
import { PlanHqSquadSection } from './plan-hq-squad-section';
import { PlanSlotsSection } from './plan-slots-section';
import { PlanUrlSection } from './plan-url-section';

type PlanManagementSectionsProps = {
  model: HqPlansState;
  selectedPlan: HeadquartersGamePlan;
  selectedGame?: Game;
  selectedCommander?: HeadquartersGamePlan['gameCommander'];
  currentSquad?: User['squad'];
  currentUserId?: string;
  isHqAdmin: boolean;
  canManageHqSquad: boolean;
  isInHqSquad: boolean;
  canUnassignHqSquad: boolean;
  isCommander: boolean;
  canEditCommanderFields: boolean;
  currentSide?: Side['type'];
  deleteHqCommentModel: DeleteMissionCommentState;
};

export const PlanManagementSections = observer(
  ({
    model,
    selectedPlan,
    selectedGame,
    selectedCommander,
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
  }: PlanManagementSectionsProps) => {
    const canDeleteHeadquartersComment = (comment: HeadquartersComment) =>
      isHqAdmin || Boolean(currentUserId && comment.userId === currentUserId);

    const canEditHeadquartersComment = (comment: HeadquartersComment) =>
      !session.isCommunicationMuted && Boolean(currentUserId && comment.userId === currentUserId);

    return (
      <div className="flex flex-col gap-4">
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
          selectedGame={selectedGame}
          currentSquad={currentSquad}
          canEditCommanderFields={canEditCommanderFields}
          squadOptions={model.getSquadOptions(currentSide)}
        />
        <PlanCommentsSection
          model={model}
          selectedPlanId={selectedPlan.id}
          deleteHqCommentModel={deleteHqCommentModel}
          canDeleteHeadquartersComment={canDeleteHeadquartersComment}
          canEditHeadquartersComment={canEditHeadquartersComment}
        />
      </div>
    );
  },
);
