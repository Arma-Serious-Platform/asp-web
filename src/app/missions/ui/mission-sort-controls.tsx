'use client';

import { Tab } from '@/shared/ui/moleculas/tab';
import { cn } from '@/shared/utils/cn';

type MissionSortControlsProps = {
  orderType: 'asc' | 'desc';
  onChange: (orderType: 'asc' | 'desc') => void;
  className?: string;
};

const missionSortOptions = [
  { label: 'Спочатку новіші', value: 'desc' },
  { label: 'Спочатку старіші', value: 'asc' },
] as const;

export const MissionSortControls = ({ orderType, onChange, className }: MissionSortControlsProps) => (
  <div
    aria-label="Сортування місій"
    className={cn('flex overflow-hidden rounded-lg border border-white/10 bg-black/30', className)}>
    {missionSortOptions.map(option => (
      <Tab
        key={option.value}
        title={option.label}
        isActive={orderType === option.value}
        className="w-auto border-b-0 px-3 py-1.5 text-xs"
        onClick={() => onChange(option.value)}
      />
    ))}
  </div>
);

export type { MissionSortControlsProps };
