'use client';

import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { ReactNode, useMemo } from 'react';

import { Game, HeadquartersGamePlan, HeadquartersSlot, MissionGameSide, Squad } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { FormReadonlyField } from '@/shared/ui/atoms/form-readonly-field';
import { Input, NumericInput } from '@/shared/ui/atoms/input';
import { Select } from '@/shared/ui/atoms/select';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { HqPlansState } from '../state/hq-plans.state';
import { TableCellTooltip } from './table-cell-tooltip';
import { cn } from '@/shared/utils/cn';
import { MissionModel } from '@/entities/mission/mission.model';

const normalizeSlotCount = (value: number | null | undefined) => (typeof value === 'number' ? value : 0);

const joinSquadTags = (squads: Pick<Squad, 'tag'>[]) => squads.map(s => s.tag).join(', ');

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

const SlotFieldLabel = ({ children }: { children: ReactNode }) => (
  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">{children}</span>
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
    const totalSlots = selectedPlan.slots.reduce((sum, slot) => sum + normalizeSlotCount(slot.slotCount), 0);
    const totalOccupied = selectedPlan.slots.reduce((sum, slot) => {
      if (!slot.assignedSquads.length) {
        return sum;
      }

      return sum + normalizeSlotCount(slot.slotCount);
    }, 0);

    const renderSquadChips = (squads: HeadquartersSlot['assignedSquads']) => (
      <div className="flex flex-wrap gap-2">
        {squads.map(squad => (
          <div
            key={squad.id}
            className="flex items-center gap-1 rounded-md border border-white/10 bg-black/30 px-2 py-1">
            <Image
              src={model.squadsById[squad.id]?.logo?.url || '/images/avatar.jpg'}
              width={16}
              height={16}
              alt={squad.tag}
              className="size-4 rounded-full object-cover"
              unoptimized={!model.squadsById[squad.id]?.logo?.url?.startsWith('https')}
            />
            <span className="text-xs text-zinc-200">{squad.tag}</span>
          </div>
        ))}
      </div>
    );

    const getSlotFields = (slot: HeadquartersSlot) => {
      const wantedSquads = model.getWantedSquadsForSlot(slot, currentSquad);
      const isWantedByMySquad = Boolean(currentSquad && wantedSquads.some(squad => squad.id === currentSquad.id));
      const isWantedUpdating = slot.id in model.wantedSlotOverrides;
      const slotCountDisplay = String(Math.min(99, Math.max(0, Number(slot.slotCount) || 0)));

      const nazvaDisplay = canEditCommanderFields
        ? model.getSlotNazvaDraft(slot)
        : [slot.name, slot.weaponry].filter(Boolean).join(' | ');
      const nameField = (
        <TableCellTooltip text={nazvaDisplay}>
          {canEditCommanderFields ? (
            <Input
              className="min-w-0 w-full"
              value={model.getSlotNazvaDraft(slot)}
              onChange={event => model.setSlotDraft(slot.id, 'name', event.target.value)}
              onBlur={event =>
                void model.updateSlotField(
                  slot.id,
                  { name: event.target.value || null, weaponry: null },
                  ['name', 'weaponry'],
                )
              }
            />
          ) : (
            <FormReadonlyField className="text-xs leading-relaxed" value={nazvaDisplay} />
          )}
        </TableCellTooltip>
      );

      const slotCountField = (
        <TableCellTooltip
          text={canEditCommanderFields ? model.getSlotCountDraft(slot) : slotCountDisplay}>
          {canEditCommanderFields ? (
            <NumericInput
              className="min-w-0 w-full"
              min={0}
              max={99}
              maxLength={2}
              value={model.getSlotCountDraft(slot)}
              onChange={event => model.setSlotDraft(slot.id, 'slotCount', event.target.value)}
              onBlur={event => {
                const n = Number(event.target.value);
                const clamped = Number.isFinite(n) ? Math.min(99, Math.max(0, Math.floor(n))) : 0;
                void model.updateSlotField(slot.id, { slotCount: clamped }, ['slotCount']);
              }}
            />
          ) : (
            <FormReadonlyField className="text-center" value={slotCountDisplay} />
          )}
        </TableCellTooltip>
      );

      const assignedField = canEditCommanderFields ? (
        <TableCellTooltip text={joinSquadTags(slot.assignedSquads)}>
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
        </TableCellTooltip>
      ) : (
        <TableCellTooltip text={joinSquadTags(slot.assignedSquads)}>
          {renderSquadChips(slot.assignedSquads)}
        </TableCellTooltip>
      );

      const wantedField = (
        <div className="flex flex-col gap-2">
          <TableCellTooltip text={joinSquadTags(wantedSquads)}>{renderSquadChips(wantedSquads)}</TableCellTooltip>
          {currentSquad && (
            <Button
              size="sm"
              variant="outline"
              className="w-fit"
              disabled={isWantedUpdating}
              onClick={() => void model.toggleWantedSlot(slot, !isWantedByMySquad)}>
              {isWantedByMySquad ? 'Більше не хочемо' : 'Хочемо цей слот'}
            </Button>
          )}
        </div>
      );

      const spawnPointField = (
        <TableCellTooltip
          text={canEditCommanderFields ? model.getSlotTextDraft(slot, 'spawnPoint') : slot.spawnPoint ?? ''}>
          {canEditCommanderFields ? (
            <Input
              className="min-w-0 w-full"
              value={model.getSlotTextDraft(slot, 'spawnPoint')}
              onChange={event => model.setSlotDraft(slot.id, 'spawnPoint', event.target.value)}
              onBlur={event =>
                void model.updateSlotField(slot.id, { spawnPoint: event.target.value || null }, ['spawnPoint'])
              }
            />
          ) : (
            <FormReadonlyField className="text-xs leading-relaxed" value={slot.spawnPoint ?? ''} />
          )}
        </TableCellTooltip>
      );

      const commentField = (
        <TableCellTooltip
          text={canEditCommanderFields ? model.getSlotTextDraft(slot, 'comment') : slot.comment ?? ''}>
          {canEditCommanderFields ? (
            <Input
              className="min-w-0 w-full"
              value={model.getSlotTextDraft(slot, 'comment')}
              onChange={event => model.setSlotDraft(slot.id, 'comment', event.target.value)}
              onBlur={event =>
                void model.updateSlotField(slot.id, { comment: event.target.value || null }, ['comment'])
              }
            />
          ) : (
            <FormReadonlyField className="text-xs leading-relaxed" value={slot.comment ?? ''} />
          )}
        </TableCellTooltip>
      );

      return {
        slotNumber: (
          <TableCellTooltip text={String(slot.slotNumber)}>
            <span className="text-zinc-100">{slot.slotNumber}</span>
          </TableCellTooltip>
        ),
        nameField,
        slotCountField,
        assignedField,
        wantedField,
        spawnPointField,
        commentField,
      };
    };

    const renderSlotRow = (slot: HeadquartersSlot) => {
      const fields = getSlotFields(slot);

      return (
        <tr key={slot.id} className="border-b border-white/5 align-top">
          <td className="px-2 py-2">{fields.slotNumber}</td>
          <td className="px-2 py-2">{fields.nameField}</td>
          <td className="px-2 py-2">{fields.slotCountField}</td>
          <td className="px-2 py-2">{fields.assignedField}</td>
          <td className="px-2 py-2">{fields.wantedField}</td>
          <td className="px-2 py-2">{fields.spawnPointField}</td>
          <td className="px-2 py-2">{fields.commentField}</td>
        </tr>
      );
    };

    const renderSlotCard = (slot: HeadquartersSlot) => {
      const fields = getSlotFields(slot);

      return (
        <div key={slot.id} className="flex flex-col gap-3 rounded-lg border border-white/10 bg-black/40 p-3">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
            <SlotFieldLabel>Відділення</SlotFieldLabel>
            <span className="text-sm font-semibold text-zinc-100">{fields.slotNumber}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <SlotFieldLabel>Назва</SlotFieldLabel>
            {fields.nameField}
          </div>

          <div className="flex flex-col gap-1.5">
            <SlotFieldLabel>Слоти</SlotFieldLabel>
            {fields.slotCountField}
          </div>

          <div className="flex flex-col gap-1.5">
            <SlotFieldLabel>Бронювання</SlotFieldLabel>
            {fields.assignedField}
          </div>

          <div className="flex flex-col gap-1.5">
            <SlotFieldLabel>Бажаючі</SlotFieldLabel>
            {fields.wantedField}
          </div>

          <div className="flex flex-col gap-1.5">
            <SlotFieldLabel>Спавн</SlotFieldLabel>
            {fields.spawnPointField}
          </div>

          <div className="flex flex-col gap-1.5">
            <SlotFieldLabel>Коментар</SlotFieldLabel>
            {fields.commentField}
          </div>
        </div>
      );
    };

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
      const primarySide =
        (planSideType && uniqueSides.includes(planSideType) ? planSideType : null) || uniqueSides[0];
      const secondarySide = uniqueSides.find(side => side !== primarySide) ?? null;

      return {
        primarySlots: selectedPlan.slots.filter(
          slot => !slot.missionGameSide || slot.missionGameSide === primarySide,
        ),
        secondarySlots: secondarySide
          ? selectedPlan.slots.filter(slot => slot.missionGameSide === secondarySide)
          : [],
        primarySide,
        secondarySide,
      };
    }, [selectedPlan.slots, selectedPlan.side?.type]);

    const missionVersion = selectedGame?.missionVersion;
    const primaryTitle =
      getInGameSideName(primarySide, missionVersion) ?? (secondarySlots.length > 0 ? 'Основна сторона' : null);
    const secondaryTitle = getInGameSideName(secondarySide, missionVersion) ?? 'Союзна сторона';

    const renderSlotsGroup = (slots: HeadquartersSlot[], title: string | null, side?: MissionGameSide | null) => (
      <div className="flex flex-col gap-3">
        {title && (
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
            <span className={cn(side ? MissionModel.sideTypeColors[side] : 'text-zinc-400')}>{title}</span>
          </div>
        )}

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-fit border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400">
                <th className="px-2 py-2">Відділення</th>
                <th className="min-w-[780px] px-2 py-2">Назва</th>
                <th className="min-w-[50px] px-2 py-2">Слоти</th>
                <th className="min-w-[170px] px-2 py-2">Бронювання</th>
                <th className="px-2 py-2">Бажаючі</th>
                <th className="min-w-[200px] px-2 py-2">Спавн</th>
                <th className="min-w-[400px] px-2 py-2">Коментар</th>
              </tr>
            </thead>
            <tbody>{slots.map(renderSlotRow)}</tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">{slots.map(renderSlotCard)}</div>
      </div>
    );

    return (
      <div className="rounded-lg border border-white/10 bg-black/20 p-3">
        <button
          type="button"
          className="mb-2 flex w-full cursor-pointer items-center justify-between rounded-md px-1 py-1 transition-colors hover:bg-white/5"
          onClick={() => {
            model.isSlotsOpen = !model.isSlotsOpen;
          }}>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Слоти</div>
          <div className="text-xs text-zinc-400">
            Всього: {totalSlots} · Зайнято: {totalOccupied} · Вільно: {Math.max(totalSlots - totalOccupied, 0)}
          </div>
          {model.isSlotsOpen ? (
            <ChevronUpIcon className="size-4 text-zinc-400" />
          ) : (
            <ChevronDownIcon className="size-4 text-zinc-400" />
          )}
        </button>
        {model.isSlotsOpen && (
          <div className="flex flex-col gap-4">
            {renderSlotsGroup(primarySlots, primaryTitle, primarySide)}
            {secondarySlots.length > 0 && renderSlotsGroup(secondarySlots, secondaryTitle, secondarySide)}
          </div>
        )}
      </div>
    );
  },
);
