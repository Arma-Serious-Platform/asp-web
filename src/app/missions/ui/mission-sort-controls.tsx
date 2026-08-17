'use client';

import { Tab } from '@/shared/ui/moleculas/tab';
import { cn } from '@/shared/utils/cn';
import {
  MissionOrderBySchema,
  MissionOrderTypeSchema,
  type FindMissionsDto,
  type MissionOrderBy,
  type MissionOrderType,
} from '@/shared/sdk/types';

export type MissionSortValue = Required<Pick<FindMissionsDto, 'orderBy' | 'orderType'>>;

type MissionSortControlsProps = {
  value: MissionSortValue;
  onChange: (value: MissionSortValue) => void;
  className?: string;
};

type MissionSortOption = MissionSortValue & { label: string; key: string };

type MissionSortGroup = {
  label: string;
  options: MissionSortOption[];
};

const missionSortGroups: MissionSortGroup[] = [
  {
    label: 'За датою створення',
    options: [
      {
        key: 'createdAt-desc',
        label: 'Спочатку нові',
        orderBy: MissionOrderBySchema.enum.createdAt,
        orderType: MissionOrderTypeSchema.enum.desc,
      },
      {
        key: 'createdAt-asc',
        label: 'Спочатку старі',
        orderBy: MissionOrderBySchema.enum.createdAt,
        orderType: MissionOrderTypeSchema.enum.asc,
      },
    ],
  },
  {
    label: 'За оновленнями',
    options: [
      {
        key: 'latestVersionUpdatedAt-desc',
        label: 'Спочатку свіжіші',
        orderBy: MissionOrderBySchema.enum.latestVersionUpdatedAt,
        orderType: MissionOrderTypeSchema.enum.desc,
      },
      {
        key: 'latestVersionUpdatedAt-asc',
        label: 'Спочатку старіші',
        orderBy: MissionOrderBySchema.enum.latestVersionUpdatedAt,
        orderType: MissionOrderTypeSchema.enum.asc,
      },
    ],
  },
];

const isSameSort = (a: MissionSortValue, b: MissionSortValue) => a.orderBy === b.orderBy && a.orderType === b.orderType;

export const MissionSortControls = ({ value, onChange, className }: MissionSortControlsProps) => (
  <div aria-label="Сортування місій" className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2', className)}>
    {missionSortGroups.map(group => (
      <div key={group.label} className="flex min-w-0 flex-col gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">{group.label}</span>
        <div className="flex overflow-hidden rounded-lg border border-white/10 bg-black/30">
          {group.options.map(option => (
            <Tab
              key={option.key}
              title={option.label}
              isActive={isSameSort(value, option)}
              className="min-w-fit w-full border-b-0 px-3 py-1.5 text-xs justify-center"
              onClick={() => onChange({ orderBy: option.orderBy, orderType: option.orderType })}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export type { MissionSortControlsProps, MissionOrderBy, MissionOrderType };
