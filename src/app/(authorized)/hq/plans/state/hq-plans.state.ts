import dayjs from 'dayjs';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

import { headquartersApi, squadsApi } from '@/shared/sdk';
import {
  HeadquartersComment,
  HeadquartersGamePlan,
  HeadquartersGamePlanListItem,
  HeadquartersSlot,
  MissionCommentMessage,
  SideType,
  Squad,
} from '@/shared/sdk/types';

export const ARCHIVE_PLANS_PAGE_SIZE = 8;

export type SlotDraftField = keyof Pick<
  HeadquartersSlot,
  'name' | 'weaponry' | 'slotCount' | 'spawnPoint' | 'comment'
>;
export type SlotDrafts = Record<string, Partial<Record<SlotDraftField, string>>>;
export type WantedSlotOverrides = Record<string, boolean>;
export type PlanTimeCategory = 'today' | 'tomorrow' | 'future' | 'archive';

const areSamePayload = <T,>(a: T, b: T) => JSON.stringify(a) === JSON.stringify(b);

export const getPlanTimeCategory = (date?: string | null): PlanTimeCategory | null => {
  if (!date || !dayjs(date).isValid()) {
    return null;
  }

  const planDate = dayjs(date).startOf('day');
  const today = dayjs().startOf('day');

  if (planDate.isSame(today)) {
    return 'today';
  }

  if (planDate.isSame(today.add(1, 'day'))) {
    return 'tomorrow';
  }

  if (planDate.isAfter(today)) {
    return 'future';
  }

  return 'archive';
};

class HqPlansState {
  constructor() {
    makeAutoObservable(this);
  }

  isLoading = false;
  plans: HeadquartersGamePlanListItem[] = [];
  selectedPlan: HeadquartersGamePlan | null = null;
  isSelectedPlanLoading = false;
  private requestedPlanId: string | null = null;
  visibleArchiveCount = ARCHIVE_PLANS_PAGE_SIZE;
  squadsById: Record<string, Squad> = {};
  isSlotsOpen = true;
  comments: HeadquartersComment[] = [];
  isCommentsLoading = false;
  isCommentSending = false;
  slotDrafts: SlotDrafts = {};
  planUrlDraft: string | null = null;
  wantedSlotOverrides: WantedSlotOverrides = {};
  wantedSlotOverrideTimeouts: Record<string, number> = {};

  getPlanGameDate = (plan: HeadquartersGamePlanListItem) => plan.game?.date ?? null;

  private sortPlansByGameDateAsc = (a: HeadquartersGamePlanListItem, b: HeadquartersGamePlanListItem) =>
    dayjs(this.getPlanGameDate(a)).valueOf() - dayjs(this.getPlanGameDate(b)).valueOf();

  private sortPlansByGameDateDesc = (a: HeadquartersGamePlanListItem, b: HeadquartersGamePlanListItem) =>
    dayjs(this.getPlanGameDate(b)).valueOf() - dayjs(this.getPlanGameDate(a)).valueOf();

  get todayPlans() {
    return this.plans
      .filter(plan => getPlanTimeCategory(this.getPlanGameDate(plan)) === 'today')
      .sort(this.sortPlansByGameDateAsc);
  }

  get tomorrowPlans() {
    return this.plans
      .filter(plan => getPlanTimeCategory(this.getPlanGameDate(plan)) === 'tomorrow')
      .sort(this.sortPlansByGameDateAsc);
  }

  get futurePlans() {
    return this.plans
      .filter(plan => getPlanTimeCategory(this.getPlanGameDate(plan)) === 'future')
      .sort(this.sortPlansByGameDateAsc);
  }

  get archivePlans() {
    return this.plans
      .filter(plan => getPlanTimeCategory(this.getPlanGameDate(plan)) === 'archive')
      .sort(this.sortPlansByGameDateDesc);
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

  getPlanListItemById = (planId?: string) => this.plans.find(plan => plan.id === planId) ?? null;

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
      const [plansRes, squadsRes] = await Promise.all([
        headquartersApi.findHeadquartersPlans({ take: 200, skip: 0 }),
        squadsApi.findSquads({ take: 1000, skip: 0 }),
      ]);

      const squads = squadsRes.data.data ?? [];
      this.squadsById = Object.fromEntries(squads.map(squad => [squad.id, squad]));

      this.plans = (plansRes.data.data ?? []).filter(plan => plan.side?.type === currentSide);
      this.visibleArchiveCount = ARCHIVE_PLANS_PAGE_SIZE;
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося завантажити плани штабу');
    } finally {
      this.isLoading = false;
    }
  };

  loadPlan = async (planId?: string) => {
    this.requestedPlanId = planId ?? null;

    if (!planId) {
      this.selectedPlan = null;
      this.isSelectedPlanLoading = false;
      return;
    }

    if (this.selectedPlan?.id !== planId) {
      this.selectedPlan = null;
    }

    this.isSelectedPlanLoading = true;

    try {
      const { data } = await headquartersApi.findHeadquartersPlanById(planId);

      // Drop the response if the user already navigated to another plan.
      if (this.requestedPlanId !== planId) {
        return;
      }

      this.selectedPlan = data;
    } catch (error) {
      if (this.requestedPlanId !== planId) {
        return;
      }

      console.error(error);
      toast.error('Не вдалося завантажити план');
    } finally {
      if (this.requestedPlanId === planId) {
        this.isSelectedPlanLoading = false;
      }
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
    if (nextPlan.hqSquad) {
      this.squadsById = {
        ...this.squadsById,
        [nextPlan.hqSquad.id]: {
          ...this.squadsById[nextPlan.hqSquad.id],
          ...nextPlan.hqSquad,
        } as Squad,
      };
    }

    if (this.selectedPlan?.id === nextPlan.id && !areSamePayload(this.selectedPlan, nextPlan)) {
      this.selectedPlan = nextPlan;
    }

    // The list keeps its lightweight shape; only patch the fields it renders.
    this.plans = this.plans.map(item => {
      if (item.id !== nextPlan.id) {
        return item;
      }

      const patched: HeadquartersGamePlanListItem = {
        ...item,
        gameCommanderId: nextPlan.gameCommanderId,
        gameCommander: nextPlan.gameCommander,
        hqSquadId: nextPlan.hqSquadId,
        hqSquad: nextPlan.hqSquad,
        side: nextPlan.side ?? item.side,
      };

      return areSamePayload(item, patched) ? item : patched;
    });
  };

  replaceSlot = (slot: HeadquartersSlot) => {
    const plan = this.selectedPlan;
    if (!plan) {
      return;
    }

    const slotIndex = plan.slots.findIndex(item => item.id === slot.id);
    if (slotIndex === -1 || areSamePayload(plan.slots[slotIndex], slot)) {
      return;
    }

    const slots = [...plan.slots];
    slots[slotIndex] = slot;

    this.selectedPlan = {
      ...plan,
      slots,
    };
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

  getSlotNazvaDraft = (slot: HeadquartersSlot) => {
    if (this.slotDrafts[slot.id]?.name !== undefined) {
      return this.slotDrafts[slot.id]?.name ?? '';
    }

    return [slot.name, slot.weaponry].filter(Boolean).join(' | ');
  };

  getSlotCountDraft = (slot: HeadquartersSlot) =>
    this.slotDrafts[slot.id]?.slotCount ?? String(Math.min(99, Math.max(0, Number(slot.slotCount) || 0)));

  updateSlotField = async (
    slotId: string,
    dto: Parameters<typeof headquartersApi.updateHeadquartersSlot>[1],
    draftFields: SlotDraftField[] = Object.keys(dto) as SlotDraftField[],
  ) => {
    try {
      const { data } = await headquartersApi.updateHeadquartersSlot(slotId, dto);
      this.replaceSlot(data);
      this.clearSlotDrafts(slotId, draftFields);
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося оновити слот');
    }
  };

  updatePlanUrl = async (planId: string, value: string) => {
    try {
      const { data } = await headquartersApi.updateHeadquartersPlan(planId, { planUrl: value || null });
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
        const { data } = await headquartersApi.assignHeadquartersSlotSquad(slot.id, { squadId });
        latestSlot = data;
      }

      for (const squadId of toUnassign) {
        const { data } = await headquartersApi.unassignHeadquartersSlotSquad(slot.id, { squadId });
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
      const { data } = await headquartersApi.findHeadquartersComments(gamePlanId, { take: 100, skip: 0 });
      this.comments = [...(data.data ?? [])].sort(
        (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
      );
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося завантажити коментарі');
    } finally {
      this.isCommentsLoading = false;
    }
  };

  confirmDeleteHeadquartersComment = async (commentId: string) => {
    try {
      await headquartersApi.deleteHeadquartersComment(commentId);
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
      const { data } = await headquartersApi.createHeadquartersComment(gamePlanId, { message, attachments });
      this.comments = this.comments.some(item => item.id === data.id) ? this.comments : [...this.comments, data];
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося додати коментар');
      throw error;
    } finally {
      this.isCommentSending = false;
    }
  };

  updateComment = async (
    commentId: string,
    payload: {
      lexicalState: MissionCommentMessage;
      attachments: File[];
      removedAttachmentIds: string[];
    },
  ) => {
    this.isCommentSending = true;

    try {
      const { data } = await headquartersApi.updateHeadquartersComment(commentId, {
        message: payload.lexicalState,
        attachments: payload.attachments,
        removedAttachmentIds: payload.removedAttachmentIds,
      });
      this.comments = this.comments.map(item => (item.id === data.id ? data : item));
      toast.success('Коментар оновлено');
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося оновити коментар');
      throw error;
    } finally {
      this.isCommentSending = false;
    }
  };

  assignCommander = async (planId: string) => {
    const { data } = await headquartersApi.assignHeadquartersCommander(planId);
    this.replacePlan(data);
  };

  unassignCommander = async (planId: string) => {
    const { data } = await headquartersApi.unassignHeadquartersCommander(planId);
    this.replacePlan(data);
  };

  assignHqSquad = async (planId: string) => {
    const { data } = await headquartersApi.assignHeadquartersHqSquad(planId);
    this.replacePlan(data);
  };

  unassignHqSquad = async (planId: string) => {
    const { data } = await headquartersApi.unassignHeadquartersHqSquad(planId);
    this.replacePlan(data);
  };

  toggleWantedSlot = async (slot: HeadquartersSlot, nextWantedState: boolean) => {
    this.wantedSlotOverrides = {
      ...this.wantedSlotOverrides,
      [slot.id]: nextWantedState,
    };

    try {
      const { data } = nextWantedState
        ? await headquartersApi.assignHeadquartersSlotWantedSquad(slot.id)
        : await headquartersApi.unassignHeadquartersSlotWantedSquad(slot.id);
      this.replaceSlot(data);
      this.scheduleWantedSlotOverrideClear(slot.id);
    } catch (error) {
      this.clearWantedSlotOverride(slot.id);
      console.error(error);
      toast.error('Не вдалося змінити список бажаючих');
    }
  };
}

export { HqPlansState };
