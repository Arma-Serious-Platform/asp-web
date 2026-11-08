'use client';

import { cn } from '@/shared/utils/cn';
import { CrosshairIcon } from 'lucide-react';
import { MissionWeaponry, MissionGameSide } from '@/shared/sdk/types';
import { AccordionToggle } from '@/shared/ui/moleculas/accordion-toggle';
import { FC } from 'react';

type WeaponrySectionProps = {
  weaponry: MissionWeaponry[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  sideType: MissionGameSide;
};

export const WeaponrySection: FC<WeaponrySectionProps> = ({ weaponry, isOpen, setIsOpen, sideType }) => {
  if (weaponry.length === 0) {
    return null;
  }

  return (
    <div className="pt-2 border-t border-white/5">
      <AccordionToggle
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        icon={<CrosshairIcon />}
        title="Озброєння"
        meta={`(${weaponry.length})`}
      />
      {isOpen && (
        <div className="mt-2 flex flex-col gap-1.5">
          {weaponry.map((weaponryItem, index) => (
            <div
              key={weaponryItem.id || index}
              className="flex items-center gap-3 rounded-md border border-white/10 bg-black/30 px-2.5 py-2">
              <div
                className={cn('min-w-0 flex-1 break-words text-sm font-semibold', {
                  'text-destructive': sideType === MissionGameSide.RED,
                  'text-green-400': sideType === MissionGameSide.GREEN,
                  'text-blue-400': sideType === MissionGameSide.BLUE,
                })}>
                {weaponryItem.name}
                {weaponryItem.description && (
                  <span className="text-xs font-medium text-zinc-400"> ({weaponryItem.description})</span>
                )}
              </div>
              <span
                className={cn('shrink-0 text-sm font-semibold tabular-nums text-zinc-300', {
                  'text-destructive': sideType === MissionGameSide.RED,
                  'text-green-400': sideType === MissionGameSide.GREEN,
                  'text-blue-400': sideType === MissionGameSide.BLUE,
                })}>
                x{weaponryItem.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
