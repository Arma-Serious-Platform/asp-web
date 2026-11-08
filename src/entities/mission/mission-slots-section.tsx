'use client';

import { UsersIcon } from 'lucide-react';
import { FC } from 'react';
import { MissionModel } from '@/entities/mission/mission.model';
import { MissionSlot } from '@/shared/sdk/types';
import { AccordionToggle } from '@/shared/ui/moleculas/accordion-toggle';

type MissionSlotsSectionProps = {
  slots?: MissionSlot[] | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

/** Slot names from the mission file always start with `1.` — drop it on top of the role index prefix. */
const formatSlotName = (name: string | null) =>
  name ? MissionModel.stripRoleNamePrefix(name).replace(/^\d+\.\s*/, '') : '';

const formatSlotCount = (count: number | null) => String(Math.min(99, Math.max(0, Number(count) || 0)));

export const MissionSlotsSection: FC<MissionSlotsSectionProps> = ({ slots, isOpen, setIsOpen }) => {
  if (!slots?.length) {
    return null;
  }

  return (
    <div className="pt-2 border-t border-white/5">
      <AccordionToggle
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        icon={<UsersIcon />}
        title="Слоти"
      />
      {isOpen && (
        <div className="mt-2 flex flex-col gap-1.5">
          {slots.map((slot, index) => {
            const name = formatSlotName(slot.name);

            return (
              <div
                key={`${slot.callsign}-${index}`}
                className="flex items-center gap-3 rounded-md border border-white/10 bg-black/30 px-2.5 py-2">
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span title={slot.callsign} className="truncate text-sm font-bold leading-tight text-zinc-400">
                    {slot.callsign}
                  </span>
                  <span className="whitespace-normal break-words text-sm font-semibold leading-snug tracking-tight text-zinc-100">
                    {name || '—'}
                  </span>
                </span>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/50 text-[11px] font-bold tabular-nums text-zinc-200">
                  {formatSlotCount(slot.count)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
