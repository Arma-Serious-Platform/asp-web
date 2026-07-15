import dayjs from 'dayjs';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

import { getGamesInCurrentWeek } from '@/entities/weekend/lib';
import { api } from '@/shared/sdk';
import {
  Game,
  HeadquartersComment,
  HeadquartersGamePlan,
  HeadquartersSlot,
  MissionCommentMessage,
  Side,
  SideType,
  Squad,
  User,
} from '@/shared/sdk/types';

import {
  ARCHIVE_PLANS_PAGE_SIZE,
  areSamePayload,
  getPlanTimeCategory,
  SlotDraftField,
  SlotDrafts,
  sortPlansAscending,
  sortPlansDescending,
  WantedSlotOverrides,
} from './lib';

class HqPlansModel {
  constructor() {
    makeAutoObservable(this);
  }

  isLoading = false;
  plans: HeadquartersGamePlan[] = [];
  visibleArchiveCount = ARCHIVE_PLANS_PAGE_SIZE;
  usersById: Record<string, User> = {};
  squadsById: Record<string, Squad> = {};
  gamesById: Record<string, Game> = {};
  sidesById: Record<string, Side> = {};
  isSlotsOpen = true;
  comments: HeadquartersComment[] = [];
  isCommentsLoading = false;
  isCommentSending = false;
  slotDrafts: SlotDrafts = {};
  planUrlDraft: string | null = null;
  wantedSlotOverrides: WantedSlotOverrides = {};
  wantedSlotOverrideTimeouts: Record<string, number> = {};

  get todayPlans() {
    return this.plans.filter(plan => getPlanTimeCategory(plan.game?.date) === 'today').sort(sortPlansAscending);
  }

  get tomorrowPlans() {
    return this.plans.filter(plan => getPlanTimeCategory(plan.game?.date) === 'tomorrow').sort(sortPlansAscending);
  }

  get futurePlans() {
    return this.plans.filter(plan => getPlanTimeCategory(plan.game?.date) === 'future').sort(sortPlansAscending);
  }

  get archivePlans() {
    return this.plans.filter(plan => getPlanTimeCategory(plan.game?.date) === 'archive').sort(sortPlansDescending);
  }

  get visibleArchivePlans() {
    return this.archivePlans.slice(0, this.visibleArchiveCount);
  }

  get hasMoreArchivePlans() {
    return this.visibleArchiveCount < this.archivePlans.length;
  }

  get hasAnyPlans() {
    return (
      this.todayPlans.length > 0 ||
      this.tomorrowPlans.length > 0 ||
      this.futurePlans.length > 0 ||
      this.archivePlans.length > 0
    );
  }

  getPlanById = (planId?: string) => this.plans.find(plan => plan.id === planId) ?? null;

  resetPlanDrafts = () => {
    this.planUrlDraft = null;
    this.slotDrafts = {};
    this.wantedSlotOverrides = {};
  };

  clearWantedSlotOverrideTimeouts = () => {
    Object.values(this.wantedSlotOverrideTimeouts).forEach(timeoutId => {
      window.clearTimeout(timeoutId);
    });
    this.wantedSlotOverrideTimeouts = {};
  };

  load = async (currentSide?: SideType) => {
    if (!currentSide) {
      return;
    }

    this.isLoading = true;

    try {
      const [weekendsRes, usersRes, squadsRes, sidesRes] = await Promise.all([
        api.findWeekends({ take: 100, skip: 0 }),
        api.findUsers({ take: 1000, skip: 0 }),
        api.findSquads({ take: 1000, skip: 0 }),
        api.findSides({ take: 1000, skip: 0 }),
      ]);

      const users = usersRes.data.data ?? [];
      const squads = squadsRes.data.data ?? [];
      const sides = sidesRes.data.data ?? [];
      this.usersById = Object.fromEntries(users.map(user => [user.id, user]));
      this.squadsById = Object.fromEntries(squads.map(squad => [squad.id, squad]));
      this.sidesById = Object.fromEntries(sides.map(side => [side.id, side]));

      const weekends = weekendsRes.data.data ?? [];
      const currentWeekGames = getGamesInCurrentWeek(weekends);
      const today = dayjs().startOf('day');
      const currentWeekGameIds = new Set(currentWeekGames.map(game => game.id));

      const historicalPastGames = weekends
        .flatMap(weekend => weekend.games ?? [])
        .filter(game => {
          const gameDate = dayjs(game.date).startOf('day');
          return gameDate.isBefore(today) && !currentWeekGameIds.has(game.id);
        })
        .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

      const games = [...currentWeekGames, ...historicalPastGames];
      this.gamesById = Object.fromEntries(games.map(game => [game.id, game]));

      const plansByGame = await Promise.allSettled(games.map(game => api.findHeadquartersPlansByGame(game.id)));
      const loadedPlans = plansByGame.flatMap(result =>
        result.status === 'fulfilled' ? (result.value.data ?? []) : ([] as HeadquartersGamePlan[]),
      );

      const uniquePlans = new Map<string, HeadquartersGamePlan>();
      loadedPlans
        .filter(plan => plan.side?.type === currentSide)
        .forEach(plan => {
          uniquePlans.set(plan.id, plan);
        });

      this.plans = Array.from(uniquePlans.values());
      this.visibleArchiveCount = ARCHIVE_PLANS_PAGE_SIZE;
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося завантажити плани штабу');
    } finally {
      this.isLoading = false;
    }
  };

  loadMoreArchivePlans = () => {
    this.visibleArchiveCount = Math.min(this.visibleArchiveCount + ARCHIVE_PLANS_PAGE_SIZE, this.archivePlans.length);
  };

  ensureArchivePlanVisible = (planId?: string) => {
    if (!planId) {
      return;
    }

    const archiveIndex = this.archivePlans.findIndex(plan => plan.id === planId);
    if (archiveIndex === -1) {
      return;
    }

    this.visibleArchiveCount = Math.max(this.visibleArchiveCount, archiveIndex + 1);
  };

  replacePlan = (nextPlan: HeadquartersGamePlan) => {
    if (nextPlan.gameCommander) {
      this.usersById = {
        ...this.usersById,
        [nextPlan.gameCommander.id]: {
          ...this.usersById[nextPlan.gameCommander.id],
          ...nextPlan.gameCommander,
        } as User,
      };
    }

    if (nextPlan.hqSquad) {
      this.squadsById = {
        ...this.squadsById,
        [nextPlan.hqSquad.id]: {
          ...this.squadsById[nextPlan.hqSquad.id],
          ...nextPlan.hqSquad,
        } as Squad,
      };
    }

    this.plans = this.plans.map(item =>
      item.id === nextPlan.id ? (areSamePayload(item, nextPlan) ? item : nextPlan) : item,
    );
  };

  replaceSlot = (slot: HeadquartersSlot) => {
    this.plans = this.plans.map(plan => {
      const slotIndex = plan.slots.findIndex(item => item.id === slot.id);
      if (slotIndex === -1 || areSamePayload(plan.slots[slotIndex], slot)) {
        return plan;
      }

      const slots = [...plan.slots];
      slots[slotIndex] = slot;

      return {
        ...plan,
        slots,
      };
    });
  };

  setSlotDraft = (slotId: string, field: SlotDraftField, value: string) => {
    this.slotDrafts = {
      ...this.slotDrafts,
      [slotId]: {
        ...this.slotDrafts[slotId],
        [field]: value,
      },
    };
  };

  clearSlotDrafts = (slotId: string, fields: SlotDraftField[]) => {
    const current = this.slotDrafts[slotId];
    if (!current) {
      return;
    }

    const next = { ...current };
    fields.forEach(field => {
      delete next[field];
    });

    if (Object.keys(next).length === 0) {
      const { [slotId]: _removed, ...rest } = this.slotDrafts;
      this.slotDrafts = rest;
      return;
    }

    this.slotDrafts = {
      ...this.slotDrafts,
      [slotId]: next,
    };
  };

  getSlotTextDraft = (slot: HeadquartersSlot, field: Exclude<SlotDraftField, 'slotCount'>) =>
    this.slotDrafts[slot.id]?.[field] ?? slot[field] ?? '';

  getSlotCountDraft = (slot: HeadquartersSlot) =>
    this.slotDrafts[slot.id]?.slotCount ?? String(Math.min(99, Math.max(0, Number(slot.slotCount) || 0)));

  updateSlotField = async (
    slotId: string,
    dto: Parameters<typeof api.updateHeadquartersSlot>[1],
    draftFields: SlotDraftField[] = Object.keys(dto) as SlotDraftField[],
  ) => {
    try {
      const { data } = await api.updateHeadquartersSlot(slotId, dto);
      this.replaceSlot(data);
      this.clearSlotDrafts(slotId, draftFields);
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося оновити слот');
    }
  };

  updatePlanUrl = async (planId: string, value: string) => {
    try {
      const { data } = await api.updateHeadquartersPlan(planId, { planUrl: value || null });
      this.replacePlan(data);
      this.planUrlDraft = null;
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося оновити посилання на план');
    }
  };

  getSquadOptions = (currentSide?: SideType) =>
    Object.values(this.squadsById)
      .filter(squad => squad.side?.type === currentSide)
      .map(squad => ({
        value: squad.id,
        label: squad.tag,
      }));

  syncAssignedSquads = async (slot: HeadquartersSlot, nextSquadIds: string[]) => {
    const currentSquadIds = slot.assignedSquads.map(squad => squad.id);
    const toAssign = nextSquadIds.filter(id => !currentSquadIds.includes(id));
    const toUnassign = currentSquadIds.filter(id => !nextSquadIds.includes(id));

    try {
      let latestSlot = slot;

      for (const squadId of toAssign) {
        const { data } = await api.assignHeadquartersSlotSquad(slot.id, { squadId });
        latestSlot = data;
      }

      for (const squadId of toUnassign) {
        const { data } = await api.unassignHeadquartersSlotSquad(slot.id, { squadId });
        latestSlot = data;
      }

      this.replaceSlot(latestSlot);
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося оновити бронювання');
    }
  };

  clearWantedSlotOverride = (slotId: string) => {
    const timeoutId = this.wantedSlotOverrideTimeouts[slotId];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      delete this.wantedSlotOverrideTimeouts[slotId];
    }

    if (!(slotId in this.wantedSlotOverrides)) {
      return;
    }

    const next = { ...this.wantedSlotOverrides };
    delete next[slotId];
    this.wantedSlotOverrides = next;
  };

  scheduleWantedSlotOverrideClear = (slotId: string) => {
    const existingTimeoutId = this.wantedSlotOverrideTimeouts[slotId];
    if (existingTimeoutId) {
      window.clearTimeout(existingTimeoutId);
    }

    this.wantedSlotOverrideTimeouts[slotId] = window.setTimeout(() => {
      this.clearWantedSlotOverride(slotId);
    }, 500);
  };

  getWantedSquadsForSlot = (slot: HeadquartersSlot, currentSquad?: Squad | null) => {
    const override = this.wantedSlotOverrides[slot.id];
    if (override === undefined || !currentSquad) {
      return slot.wantedSquads;
    }

    const hasCurrentSquad = slot.wantedSquads.some(squad => squad.id === currentSquad.id);

    if (override) {
      return hasCurrentSquad
        ? slot.wantedSquads
        : [
            ...slot.wantedSquads,
            {
              id: currentSquad.id,
              name: currentSquad.name,
              tag: currentSquad.tag,
              logo: currentSquad.logo,
            },
          ];
    }

    return slot.wantedSquads.filter(squad => squad.id !== currentSquad.id);
  };

  loadComments = async (gamePlanId: string) => {
    this.isCommentsLoading = true;

    try {
      const { data } = await api.findHeadquartersComments(gamePlanId, { take: 100, skip: 0 });
      this.comments = data.data ?? [];
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося завантажити коментарі');
    } finally {
      this.isCommentsLoading = false;
    }
  };

  confirmDeleteHeadquartersComment = async (commentId: string) => {
    try {
      await api.deleteHeadquartersComment(commentId);
      this.comments = this.comments.filter(item => item.id !== commentId);
      toast.success('Коментар видалено');
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося видалити коментар');
      throw error;
    }
  };

  createComment = async (gamePlanId: string, message: MissionCommentMessage, attachments: File[] = []) => {
    this.isCommentSending = true;

    try {
      const { data } = await api.createHeadquartersComment(gamePlanId, { message, attachments });
      this.comments = this.comments.some(item => item.id === data.id) ? this.comments : [data, ...this.comments];
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося додати коментар');
      throw error;
    } finally {
      this.isCommentSending = false;
    }
  };

  assignCommander = async (planId: string) => {
    const { data } = await api.assignHeadquartersCommander(planId);
    this.replacePlan(data);
  };

  unassignCommander = async (planId: string) => {
    const { data } = await api.unassignHeadquartersCommander(planId);
    this.replacePlan(data);
  };

  assignHqSquad = async (planId: string) => {
    const { data } = await api.assignHeadquartersHqSquad(planId);
    this.replacePlan(data);
  };

  unassignHqSquad = async (planId: string) => {
    const { data } = await api.unassignHeadquartersHqSquad(planId);
    this.replacePlan(data);
  };

  toggleWantedSlot = async (slot: HeadquartersSlot, nextWantedState: boolean) => {
    this.wantedSlotOverrides = {
      ...this.wantedSlotOverrides,
      [slot.id]: nextWantedState,
    };

    try {
      const { data } = nextWantedState
        ? await api.assignHeadquartersSlotWantedSquad(slot.id)
        : await api.unassignHeadquartersSlotWantedSquad(slot.id);
      this.replaceSlot(data);
      this.scheduleWantedSlotOverrideClear(slot.id);
    } catch (error) {
      this.clearWantedSlotOverride(slot.id);
      console.error(error);
      toast.error('Не вдалося змінити список бажаючих');
    }
  };
}

export { HqPlansModel };
