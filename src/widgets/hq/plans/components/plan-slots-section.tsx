'use client';

import { observer } from 'mobx-react-lite';
import Image from 'next/image';

import { HeadquartersGamePlan, HeadquartersSlot, Squad } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { FormReadonlyField } from '@/shared/ui/atoms/form-readonly-field';
import { Input, NumericInput } from '@/shared/ui/atoms/input';
import { Select } from '@/shared/ui/atoms/select';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { joinSquadTags, normalizeSlotCount } from '../lib';
import { HqPlansModel } from '../model';
import { TableCellTooltip } from './table-cell-tooltip';

type PlanSlotsSectionProps = {
  model: HqPlansModel;
  selectedPlan: HeadquartersGamePlan;
  currentSquad?: Squad | null;
  canEditCommanderFields: boolean;
  squadOptions: { value: string; label: string }[];
};

export const PlanSlotsSection = observer(
  ({ model, selectedPlan, currentSquad, canEditCommanderFields, squadOptions }: PlanSlotsSectionProps) => {
    const totalSlots = selectedPlan.slots.reduce((sum, slot) => sum + normalizeSlotCount(slot.slotCount), 0);
    const totalOccupied = selectedPlan.slots.reduce((sum, slot) => {
      if (!slot.assignedSquads.length) {
        return sum;
      }

      return sum + normalizeSlotCount(slot.slotCount);
    }, 0);

    const renderSlotRow = (slot: HeadquartersSlot) => {
      const wantedSquads = model.getWantedSquadsForSlot(slot, currentSquad);
      const isWantedByMySquad = Boolean(currentSquad && wantedSquads.some(squad => squad.id === currentSquad.id));
      const isWantedUpdating = slot.id in model.wantedSlotOverrides;

      return (
        <tr key={slot.id} className="border-b border-white/5 align-top">
          <td className="px-2 py-2 text-zinc-100">
            <TableCellTooltip text={String(slot.slotNumber)}>
              <span>{slot.slotNumber}</span>
            </TableCellTooltip>
          </td>
          <td className="px-2 py-2">
            <TableCellTooltip text={canEditCommanderFields ? model.getSlotTextDraft(slot, 'name') : slot.name ?? ''}>
              {canEditCommanderFields ? (
                <Input
                  className="min-w-0 w-full"
                  value={model.getSlotTextDraft(slot, 'name')}
                  onChange={event => model.setSlotDraft(slot.id, 'name', event.target.value)}
                  onBlur={event => void model.updateSlotField(slot.id, { name: event.target.value || null }, ['name'])}
                />
              ) : (
                <FormReadonlyField className="text-xs leading-relaxed" value={slot.name ?? ''} />
              )}
            </TableCellTooltip>
          </td>
          <td className="px-2 py-2">
            <TableCellTooltip
              text={canEditCommanderFields ? model.getSlotTextDraft(slot, 'weaponry') : slot.weaponry ?? ''}>
              {canEditCommanderFields ? (
                <Input
                  className="min-w-0 w-full"
                  value={model.getSlotTextDraft(slot, 'weaponry')}
                  onChange={event => model.setSlotDraft(slot.id, 'weaponry', event.target.value)}
                  onBlur={event =>
                    void model.updateSlotField(slot.id, { weaponry: event.target.value || null }, ['weaponry'])
                  }
                />
              ) : (
                <FormReadonlyField className="text-xs leading-relaxed" value={slot.weaponry ?? ''} />
              )}
            </TableCellTooltip>
          </td>
          <td className="px-2 py-2">
            <TableCellTooltip
              text={
                canEditCommanderFields
                  ? model.getSlotCountDraft(slot)
                  : String(Math.min(99, Math.max(0, Number(slot.slotCount) || 0)))
              }>
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
                <FormReadonlyField
                  className="text-center"
                  value={String(Math.min(99, Math.max(0, Number(slot.slotCount) || 0)))}
                />
              )}
            </TableCellTooltip>
          </td>
          <td className="px-2 py-2">
            {canEditCommanderFields ? (
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
                <div className="flex flex-wrap gap-2">
                  {slot.assignedSquads.map(squad => (
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
              </TableCellTooltip>
            )}
          </td>
          <td className="px-2 py-2">
            <TableCellTooltip text={joinSquadTags(wantedSquads)}>
              <div className="flex flex-wrap gap-2">
                {wantedSquads.map(squad => (
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
            </TableCellTooltip>
            {currentSquad && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                disabled={isWantedUpdating}
                onClick={() => void model.toggleWantedSlot(slot, !isWantedByMySquad)}>
                {isWantedByMySquad ? 'Більше не хочемо' : 'Хочемо цей слот'}
              </Button>
            )}
          </td>
          <td className="px-2 py-2">
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
          </td>
          <td className="px-2 py-2">
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
          </td>
        </tr>
      );
    };

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
          <div className="overflow-x-auto">
            <table className="w-fit border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="px-2 py-2">Відділення</th>
                  <th className="px-2 py-2 min-w-[380px]">Типологія</th>
                  <th className="px-2 py-2 min-w-[400px]">Техніка, озброєння</th>
                  <th className="px-2 py-2 min-w-[50px]">Слоти</th>
                  <th className="px-2 py-2 min-w-[170px]">Бронювання</th>
                  <th className="px-2 py-2">Бажаючі</th>
                  <th className="px-2 py-2 min-w-[200px]">Спавн</th>
                  <th className="px-2 py-2 min-w-[400px]">Коментар</th>
                </tr>
              </thead>
              <tbody>{selectedPlan.slots.map(renderSlotRow)}</tbody>
            </table>
          </div>
        )}
      </div>
    );
  },
);
