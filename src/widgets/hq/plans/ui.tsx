'use client';

import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

import { session } from '@/entities/session/model';
import { DeleteMissionCommentModal, DeleteMissionCommentModel } from '@/features/mission/comment/delete-comment';
import { ROUTES } from '@/shared/config/routes';
import { env } from '@/shared/config/env';
import { HeadquartersComment, HeadquartersGamePlan, HeadquartersSlot, SideType, UserRole } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';

import { PlanGameDetailsSection } from './components/plan-game-details-section';
import { PlanManagementSections } from './components/plan-management-sections';
import { PlansSidebar } from './components/plans-sidebar';
import { HqPlansModel } from './model';

type HqPlansProps = {
  activePlanId?: string;
};

export const HqPlans = observer(({ activePlanId }: HqPlansProps) => {
  const router = useRouter();
  const model = useMemo(() => new HqPlansModel(), []);
  const socketRef = useRef<Socket | null>(null);
  const selectedPlanIdRef = useRef<string | undefined>(activePlanId);
  const joinedPlanIdsRef = useRef<string[]>([]);
  const deleteHqCommentModel = useMemo(() => new DeleteMissionCommentModel(), []);

  useEffect(() => {
    selectedPlanIdRef.current = activePlanId;
  }, [activePlanId]);

  const currentUser = session.user.user;
  const hasAccess = Boolean(
    currentUser?.squad && [SideType.BLUE, SideType.RED].includes(currentUser?.squad?.side?.type as SideType),
  );
  const currentSide = currentUser?.squad?.side?.type;
  const currentSquad = currentUser?.squad;
  const isHqAdmin = [UserRole.OWNER, UserRole.SERVER_ADMIN, UserRole.UVK].includes(currentUser?.role as UserRole);

  const selectedPlan = model.getPlanById(activePlanId);
  const selectedCommander =
    selectedPlan?.gameCommander ??
    (selectedPlan?.gameCommanderId ? model.usersById[selectedPlan.gameCommanderId] : null);
  const isCommander = Boolean(currentUser?.id && selectedPlan?.gameCommanderId === currentUser.id);
  const canManageHqSquad = Boolean(
    session.canAccessHeadquarters &&
      currentUser?.squad &&
      selectedPlan?.side?.type === currentSide,
  );
  const isInHqSquad = Boolean(currentUser?.squad?.id && selectedPlan?.hqSquadId === currentUser.squad.id);
  const canUnassignHqSquad = Boolean(
    isHqAdmin || (selectedPlan?.hqSquadId && isInHqSquad && canManageHqSquad),
  );
  const canEditCommanderFields = isCommander;
  const selectedGame = selectedPlan?.gameId ? model.gamesById[selectedPlan.gameId] : undefined;
  const attackSide = selectedGame?.attackSideId ? model.sidesById[selectedGame.attackSideId] : undefined;
  const defenseSide = selectedGame?.defenseSideId ? model.sidesById[selectedGame.defenseSideId] : undefined;

  useEffect(() => {
    if (!hasAccess) {
      router.replace(ROUTES.home);
    }
  }, [hasAccess, router]);

  useEffect(() => {
    if (!hasAccess) {
      return;
    }

    void model.load(currentSide).then(() => {
      model.ensureArchivePlanVisible(activePlanId);
    });
  }, [activePlanId, currentSide, hasAccess, model]);

  useEffect(() => {
    model.resetPlanDrafts();
  }, [model, selectedPlan?.id]);

  useEffect(() => {
    model.ensureArchivePlanVisible(activePlanId);
  }, [activePlanId, model]);

  useEffect(
    () => () => {
      model.clearWantedSlotOverrideTimeouts();
    },
    [model],
  );

  useEffect(() => {
    const gamePlanId = selectedPlan?.id;
    if (!gamePlanId) {
      model.comments = [];
      return;
    }

    void model.loadComments(gamePlanId);
  }, [model, selectedPlan?.id]);

  useEffect(() => {
    if (!hasAccess || !session.isAuthorized) {
      return;
    }

    const apiBaseUrl = env.apiUrl?.replace(/\/api\/?$/, '');
    if (!apiBaseUrl) {
      return;
    }

    const socket =
      socketRef.current ??
      io(`${apiBaseUrl}/headquarters`, {
        withCredentials: true,
        transports: ['websocket'],
      });

    socketRef.current = socket;

    const handlePlanChanged = (payload: HeadquartersGamePlan) => {
      if (!payload?.id) return;
      model.replacePlan(payload);
    };

    const handleSlotUpdated = (payload: HeadquartersSlot) => {
      if (!payload?.id) return;
      model.replaceSlot(payload);
    };

    const handleCommentCreated = (payload: HeadquartersComment) => {
      if (!payload?.id || payload.gamePlanId !== selectedPlanIdRef.current) return;
      model.comments = model.comments.some(item => item.id === payload.id)
        ? model.comments
        : [payload, ...model.comments];
    };

    const handleCommentUpdated = (payload: HeadquartersComment) => {
      if (!payload?.id || payload.gamePlanId !== selectedPlanIdRef.current) return;
      model.comments = model.comments.map(item => (item.id === payload.id ? payload : item));
    };

    const handleCommentDeleted = (payload: { id: string }) => {
      if (!payload?.id) return;
      model.comments = model.comments.filter(item => item.id !== payload.id);
    };

    socket.on('game_plan_updated', handlePlanChanged);
    socket.on('commander_changed', handlePlanChanged);
    socket.on('hq_squad_changed', handlePlanChanged);
    socket.on('slot_updated', handleSlotUpdated);
    socket.on('comment_created', handleCommentCreated);
    socket.on('comment_updated', handleCommentUpdated);
    socket.on('comment_deleted', handleCommentDeleted);

    return () => {
      socket.off('game_plan_updated', handlePlanChanged);
      socket.off('commander_changed', handlePlanChanged);
      socket.off('hq_squad_changed', handlePlanChanged);
      socket.off('slot_updated', handleSlotUpdated);
      socket.off('comment_created', handleCommentCreated);
      socket.off('comment_updated', handleCommentUpdated);
      socket.off('comment_deleted', handleCommentDeleted);
    };
  }, [hasAccess, model, session.isAuthorized]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !hasAccess || !session.isAuthorized) {
      return;
    }

    const nextPlanIds = model.plans.map(plan => plan.id);
    const previousPlanIds = joinedPlanIdsRef.current;

    previousPlanIds
      .filter(planId => !nextPlanIds.includes(planId))
      .forEach(planId => {
        socket.emit('leave_game_plan', { gamePlanId: planId });
      });

    const joinPlans = () => {
      nextPlanIds.forEach(gamePlanId => {
        socket.emit('join_game_plan', { gamePlanId }, (response?: { success?: boolean; error?: string }) => {
          if (response?.error) {
            console.error(`Failed to join headquarters game plan room ${gamePlanId}:`, response.error);
          }
        });
      });
    };

    socket.on('connect', joinPlans);
    if (socket.connected) {
      joinPlans();
    }

    joinedPlanIdsRef.current = nextPlanIds;

    return () => {
      socket.off('connect', joinPlans);
      nextPlanIds.forEach(gamePlanId => {
        socket.emit('leave_game_plan', { gamePlanId });
      });
      joinedPlanIdsRef.current = [];
    };
  }, [hasAccess, model.plans]);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="container mx-auto my-6 flex flex-col gap-4 px-4">
      <DeleteMissionCommentModal
        model={deleteHqCommentModel}
        onConfirm={commentId => model.confirmDeleteHeadquartersComment(commentId)}
      />

      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <h1 className="mr-4 text-lg font-semibold text-zinc-100">Штаб</h1>
        <Link href="/hq/plans">
          <Button size="sm">Плани</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)]">
          <PlansSidebar model={model} activePlanId={activePlanId} />

          <section className="rounded-lg border border-white/10 bg-black/40 p-4">
            {!selectedPlan ? (
              <div className="flex h-full items-center justify-center py-10 text-center text-lg font-bold text-zinc-300">
                Оберіть план
              </div>
            ) : (
              <PlanGameDetailsSection
                selectedPlan={selectedPlan}
                selectedGame={selectedGame}
                attackSide={attackSide}
                defenseSide={defenseSide}
              />
            )}
          </section>
        </div>

        {selectedPlan && (
          <section className="rounded-lg border border-white/10 bg-black/40 p-4">
            <PlanManagementSections
              model={model}
              selectedPlan={selectedPlan}
              selectedCommander={selectedCommander}
              currentSquad={currentSquad}
              currentUserId={currentUser?.id}
              isHqAdmin={isHqAdmin}
              canManageHqSquad={canManageHqSquad}
              isInHqSquad={isInHqSquad}
              canUnassignHqSquad={canUnassignHqSquad}
              isCommander={isCommander}
              canEditCommanderFields={canEditCommanderFields}
              currentSide={currentSide}
              deleteHqCommentModel={deleteHqCommentModel}
            />
          </section>
        )}
      </div>
    </div>
  );
});
