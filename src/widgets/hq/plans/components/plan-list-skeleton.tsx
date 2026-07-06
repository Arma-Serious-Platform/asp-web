'use client';

import { cn } from '@/shared/utils/cn';

import { PLAN_LIST_SKELETON_COUNT, planListSkeletonPulse } from '../lib';

export function PlanListSkeleton() {
  return (
    <div className="flex min-w-max gap-2" aria-busy="true" aria-live="polite">
      <span className="sr-only">Завантаження списку планів</span>
      {Array.from({ length: PLAN_LIST_SKELETON_COUNT }, (_, i) => (
        <div key={i} className="w-[300px] shrink-0 rounded-md border border-white/10 bg-black/30 px-2 py-2">
          <div className={cn('mb-1.5 aspect-video w-full', planListSkeletonPulse)} />
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-2">
              <div className={cn('h-3.5 w-[88%] max-w-[220px]', planListSkeletonPulse)} />
              <div className={cn('h-3 w-full', planListSkeletonPulse)} />
            </div>
            <div className={cn('h-8 w-14 shrink-0', planListSkeletonPulse)} />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className={cn('h-4 min-w-0 flex-1', planListSkeletonPulse)} />
            <div className={cn('h-4 w-6 shrink-0', planListSkeletonPulse)} />
            <div className={cn('h-4 min-w-0 flex-1', planListSkeletonPulse)} />
          </div>
        </div>
      ))}
    </div>
  );
}
