'use client';

import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { ReactNode, useEffect, useMemo, useState } from 'react';

import { Game, HeadquartersGamePlan, HeadquartersSlot, MissionGameSide, Squad } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { FormReadonlyField } from '@/shared/ui/atoms/form-readonly-field';
import { Input } from '@/shared/ui/atoms/input';
import { Select } from '@/shared/ui/atoms/select';
import { ChevronDownIcon, ChevronUpIcon, MapPinIcon, MessageSquareIcon, UsersIcon } from 'lucide-react';
import { HqPlansState } from '../state/hq-plans.state';
import { TableCellTooltip } from './table-cell-tooltip';
import { cn } from '@/shared/utils/cn';

const normalizeSlotCount = (value: number | null | undefined) => (typeof value === 'number' ? value : 0);

const joinSquadTags = (squads: Pick<Squad, 'tag'>[]) => squads.map(s => s.tag).join(', ');

const stripRoleNamePrefix = (value: string) => value.replace(/^\d+:\s*/, '');

const getInGameSideName = (
  side: MissionGameSide | null | undefined,
  version?: Game['missionVersion'] | null,
): string | null => {
  if (!side || !version) return null;
  if (side === version.attackSideType) return version.attackSideName;
  if (side === version.defenseSideType) return version.defenseSideName;
  if (side === version.friendlySideType) return version.friendlySideName ?? null;
  return null;
};

const getSideStats = (slots: HeadquartersSlot[]) => {
  const total = slots.reduce((sum, slot) => sum + normalizeSlotCount(slot.slotCount), 0);
  const taken = slots.reduce((sum, slot) => {
    if (!slot.assignedSquads.length) return sum;
    return sum + normalizeSlotCount(slot.slotCount);
  }, 0);
  return { taken, total };
};

const sideFillClass: Record<MissionGameSide, string> = {
  [MissionGameSide.BLUE]: 'bg-blue-600',
  [MissionGameSide.RED]: 'bg-red-600',
  [MissionGameSide.GREEN]: 'bg-green-600',
};

const SlotFieldLabel = ({ children, icon }: { children: ReactNode; icon?: ReactNode }) => (
  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
    {icon}
    {children}
  </span>
);

type PlanSlotsSectionProps = {
  model: HqPlansState;
  selectedPlan: HeadquartersGamePlan;
  selectedGame?: Game;
  currentSquad?: Squad | null;
  canEditCommanderFields: boolean;
  squadOptions: { value: string; label: string }[];
};

export const PlanSlotsSection = observer(
  ({
    model,
    selectedPlan,
    selectedGame,
    currentSquad,
    canEditCommanderFields,
    squadOptions,
  }: PlanSlotsSectionProps) => {
    const { primarySlots, secondarySlots, primarySide, secondarySide } = useMemo(() => {
      const sides = selectedPlan.slots
        .map(slot => slot.missionGameSide)
        .filter((side): side is MissionGameSide => Boolean(side));
      const uniqueSides = [...new Set(sides)];
      if (uniqueSides.length < 2) {
        return {
          primarySlots: selectedPlan.slots,
          secondarySlots: [] as HeadquartersSlot[],
          primarySide: uniqueSides[0] ?? null,
          secondarySide: null as MissionGameSide | null,
        };
      }

      const planSideType = selectedPlan.side?.type as unknown as MissionGameSide | undefined;
      const nextPrimarySide =
        (planSideType && uniqueSides.includes(planSideType) ? planSideType : null) || uniqueSides[0];
      const nextSecondarySide = uniqueSides.find(side => side !== nextPrimarySide) ?? null;

      return {
        primarySlots: selectedPlan.slots.filter(
          slot => !slot.missionGameSide || slot.missionGameSide === nextPrimarySide,
        ),
        secondarySlots: nextSecondarySide
          ? selectedPlan.slots.filter(slot => slot.missionGameSide === nextSecondarySide)
          : [],
        primarySide: nextPrimarySide,
        secondarySide: nextSecondarySide,
      };
    }, [selectedPlan.slots, selectedPlan.side?.type]);

    const [activeSide, setActiveSide] = useState<MissionGameSide | null>(primarySide);
    const [expandedSlotIds, setExpandedSlotIds] = useState<Record<string, boolean>>({});

    useEffect(() => {
      if (activeSide === primarySide || activeSide === secondarySide) return;
      setActiveSide(primarySide);
    }, [activeSide, primarySide, secondarySide]);

    const toggleSlotExpanded = (slotId: string) =>
      setExpandedSlotIds(current => ({ ...current, [slotId]: !current[slotId] }));

    const missionVersion = selectedGame?.missionVersion;
    const primaryTitle =
      getInGameSideName(primarySide, missionVersion) ??
      (secondarySlots.length > 0 ? 'Основна сторона' : 'Сторона');
    const secondaryTitle = getInGameSideName(secondarySide, missionVersion) ?? 'Союзна сторона';

    const activeSlots = secondarySide && activeSide === secondarySide ? secondarySlots : primarySlots;

    const sideOptions = useMemo(() => {
      const options: {
        side: MissionGameSide | null;
        title: string;
        slots: HeadquartersSlot[];
      }[] = [{ side: primarySide, title: primaryTitle, slots: primarySlots }];

      if (secondarySide && secondarySlots.length > 0) {
        options.push({ side: secondarySide, title: secondaryTitle, slots: secondarySlots });
      }

      return options;
    }, [primarySide, primaryTitle, primarySlots, secondarySide, secondaryTitle, secondarySlots]);

    const renderSquadAvatar = (squad: HeadquartersSlot['assignedSquads'][number], size: 'sm' | 'md' = 'sm') => (
      <Image
        src={model.squadsById[squad.id]?.logo?.url || '/images/avatar.jpg'}
        width={size === 'sm' ? 20 : 24}
        height={size === 'sm' ? 20 : 24}
        alt={squad.tag}
        className={cn(
          'shrink-0 rounded-full object-cover ring-1 ring-black/60',
          size === 'sm' ? 'size-5' : 'size-6',
        )}
        unoptimized={!model.squadsById[squad.id]?.logo?.url?.startsWith('https')}
      />
    );

    const renderOverlappingSquads = (squads: HeadquartersSlot['assignedSquads']) => {
      if (!squads.length) return null;

      return (
        <span className="flex -space-x-1.5" title={joinSquadTags(squads)}>
          {squads.map((squad, index) => (
            <span key={squad.id} className="relative inline-flex" style={{ zIndex: index + 1 }}>
              {renderSquadAvatar(squad)}
            </span>
          ))}
        </span>
      );
    };

    const renderSquadChips = (squads: HeadquartersSlot['assignedSquads']) => {
      if (!squads.length) {
        return <span className="text-sm text-zinc-600">—</span>;
      }

      return (
        <div className="flex flex-wrap gap-1.5">
          {squads.map(squad => (
            <div
              key={squad.id}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 py-0.5 pl-0.5 pr-2.5">
              {renderSquadAvatar(squad, 'md')}
              <span className="text-xs font-medium text-zinc-200">{squad.tag}</span>
            </div>
          ))}
        </div>
      );
    };

    const renderSlotRow = (slot: HeadquartersSlot) => {
      const wantedSquads = model.getWantedSquadsForSlot(slot, currentSquad);
      const isWantedByMySquad = Boolean(currentSquad && wantedSquads.some(squad => squad.id === currentSquad.id));
      const isWantedUpdating = slot.id in model.wantedSlotOverrides;
      const slotCountDisplay = String(Math.min(99, Math.max(0, Number(slot.slotCount) || 0)));
      const isTaken = slot.assignedSquads.length > 0;
      const isExpanded = Boolean(expandedSlotIds[slot.id]);
      const nazvaRaw = canEditCommanderFields
        ? model.getSlotNazvaDraft(slot)
        : [slot.name, slot.weaponry].filter(Boolean).join(' | ');
      const nazvaDisplay = stripRoleNamePrefix(nazvaRaw);
      const spawnValue = canEditCommanderFields
        ? model.getSlotTextDraft(slot, 'spawnPoint')
        : (slot.spawnPoint ?? '');
      const commentValue = canEditCommanderFields
        ? model.getSlotTextDraft(slot, 'comment')
        : (slot.comment ?? '');

      return (
        <div
          key={slot.id}
          className={cn(
            'overflow-hidden rounded-md border transition-colors',
            isTaken ? 'border-lime-500/25 bg-lime-950/10' : 'border-white/10 bg-black/30',
            isExpanded && 'border-white/20 bg-black/40',
          )}>
          <button
            type="button"
            onClick={() => toggleSlotExpanded(slot.id)}
            className="flex w-full cursor-pointer items-center gap-3 px-2.5 py-2.5 text-left transition-colors hover:bg-white/5">
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span
                title={slot.slotNumber}
                className={cn(
                  'truncate text-base font-bold leading-tight',
                  isTaken ? 'text-lime-400' : 'text-zinc-400',
                )}>
                {slot.slotNumber}
              </span>
              <span
                title={nazvaDisplay}
                className="truncate text-base font-semibold leading-tight tracking-tight text-zinc-100">
                {nazvaDisplay || '—'}
              </span>
            </span>

            <span className="flex min-w-0 shrink-0 items-center gap-1.5">
              {isTaken ? (
                <>
                  {renderOverlappingSquads(slot.assignedSquads)}
                  <span className="hidden max-w-40 truncate text-xs font-medium text-lime-200 sm:inline">
                    {joinSquadTags(slot.assignedSquads)}
                  </span>
                </>
              ) : (
                <span className="hidden text-xs text-zinc-600 sm:inline">Вільно</span>
              )}

              {isTaken && wantedSquads.length > 0 && (
                <span className="h-5 w-px shrink-0 bg-white/25" aria-hidden />
              )}

              {renderOverlappingSquads(wantedSquads)}
            </span>

            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold tabular-nums',
                isTaken ? 'border-lime-400/40 bg-lime-950/50 text-lime-100' : 'border-white/15 bg-black/50 text-zinc-200',
              )}>
              {slotCountDisplay}
            </span>

            {isExpanded ? (
              <ChevronUpIcon className="size-3.5 shrink-0 text-zinc-500" />
            ) : (
              <ChevronDownIcon className="size-3.5 shrink-0 text-zinc-500" />
            )}
          </button>

          {isExpanded && (
            <div className="flex flex-col gap-3 border-t border-white/10 px-3 py-3">
              {canEditCommanderFields && (
                <div className="flex flex-col gap-1.5">
                  <SlotFieldLabel>Назва</SlotFieldLabel>
                  <Input
                    className="min-w-0 w-full text-base font-semibold"
                    value={nazvaDisplay}
                    onChange={event => model.setSlotDraft(slot.id, 'name', event.target.value)}
                    onBlur={event =>
                      void model.updateSlotField(
                        slot.id,
                        { name: stripRoleNamePrefix(event.target.value) || null, weaponry: null },
                        ['name', 'weaponry'],
                      )
                    }
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <SlotFieldLabel icon={<UsersIcon className="size-3" />}>Бронювання</SlotFieldLabel>
                {canEditCommanderFields ? (
                  <Select
                    multiple
                    localSearch
                    placeholder="Оберіть загони"
                    options={squadOptions}
                    value={slot.assignedSquads.map(squad => squad.id)}
                    onChange={value => {
                      void model.syncAssignedSquads(slot, value);
                    }}
                  />
                ) : (
                  <TableCellTooltip text={joinSquadTags(slot.assignedSquads)}>
                    {renderSquadChips(slot.assignedSquads)}
                  </TableCellTooltip>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <SlotFieldLabel>Бажаючі</SlotFieldLabel>
                  <TableCellTooltip text={joinSquadTags(wantedSquads)}>
                    {renderSquadChips(wantedSquads)}
                  </TableCellTooltip>
                </div>
                {currentSquad && (
                  <Button
                    size="sm"
                    variant={isWantedByMySquad ? 'default' : 'outline'}
                    className="w-fit shrink-0"
                    disabled={isWantedUpdating}
                    onClick={() => void model.toggleWantedSlot(slot, !isWantedByMySquad)}>
                    {isWantedByMySquad ? 'Більше не хочемо' : 'Хочемо цей слот'}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <SlotFieldLabel icon={<MapPinIcon className="size-3" />}>Спавн</SlotFieldLabel>
                  {canEditCommanderFields ? (
                    <Input
                      className="min-w-0 w-full"
                      value={spawnValue}
                      onChange={event => model.setSlotDraft(slot.id, 'spawnPoint', event.target.value)}
                      onBlur={event =>
                        void model.updateSlotField(slot.id, { spawnPoint: event.target.value || null }, [
                          'spawnPoint',
                        ])
                      }
                    />
                  ) : (
                    <TableCellTooltip text={spawnValue}>
                      <FormReadonlyField className="text-sm text-zinc-200" value={slot.spawnPoint ?? ''} />
                    </TableCellTooltip>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <SlotFieldLabel icon={<MessageSquareIcon className="size-3" />}>Коментар</SlotFieldLabel>
                  {canEditCommanderFields ? (
                    <Input
                      className="min-w-0 w-full"
                      value={commentValue}
                      onChange={event => model.setSlotDraft(slot.id, 'comment', event.target.value)}
                      onBlur={event =>
                        void model.updateSlotField(slot.id, { comment: event.target.value || null }, ['comment'])
                      }
                    />
                  ) : (
                    <TableCellTooltip text={commentValue}>
                      <FormReadonlyField className="text-sm text-zinc-300" value={slot.comment ?? ''} />
                    </TableCellTooltip>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="rounded-lg border border-white/10 bg-black/20 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex shrink-0 flex-row gap-2 sm:sticky sm:top-3 sm:flex-col">
            {sideOptions.map(option => {
              const stats = getSideStats(option.slots);
              const isActive =
                option.side === activeSide ||
                (activeSide == null && option.side === primarySide) ||
                (option.side == null && sideOptions.length === 1);
              const fill = option.side != null ? sideFillClass[option.side] : 'bg-zinc-600';

              return (
                <button
                  key={option.side ?? 'primary'}
                  type="button"
                  onClick={() => setActiveSide(option.side)}
                  className={cn(
                    'flex min-h-18 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-md px-2 py-2.5 text-center text-white transition-all',
                    fill,
                    isActive
                      ? 'ring-2 ring-white/90 ring-offset-2 ring-offset-black/50'
                      : 'opacity-75 hover:opacity-100',
                  )}>
                  <span className="text-lg font-black leading-none tabular-nums">
                    {stats.taken}/{stats.total}
                  </span>
                  <span className="line-clamp-2 text-[10px] font-semibold uppercase leading-tight tracking-wide">
                    {option.title}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">{activeSlots.map(renderSlotRow)}</div>
        </div>
      </div>
    );
  },
);
