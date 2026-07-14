'use client';

import { cn } from '@/shared/utils/cn';

import { PLAN_LIST_SKELETON_COUNT, planListSkeletonPulse } from '../lib';

export function PlanListSkeleton() {
  return (
    <div className="flex flex-col gap-1" aria-busy="true" aria-live="polite">
      <span className="sr-only">Завантаження списку планів</span>
      {Array.from({ length: PLAN_LIST_SKELETON_COUNT }, (_, i) => (
        <div key={i} className="flex gap-2.5 rounded-md border border-white/10 bg-black/30 px-2 py-2">
          <div className={cn('size-12 shrink-0', planListSkeletonPulse)} />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className={cn('h-3.5 w-[75%]', planListSkeletonPulse)} />
            <div className={cn('h-3 w-[55%]', planListSkeletonPulse)} />
            <div className={cn('h-2.5 w-[40%]', planListSkeletonPulse)} />
          </div>
        </div>
      ))}
    </div>
  );
}
