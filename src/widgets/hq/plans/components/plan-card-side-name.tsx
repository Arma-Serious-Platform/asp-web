'use client';

import { TooltipContent, TooltipPrimitive, TooltipProvider, TooltipTrigger } from '@/shared/ui/moleculas/tooltip';
import { cn } from '@/shared/utils/cn';

export function PlanCardSideName({
  name,
  slots,
  className,
}: {
  name: string;
  slots?: number | string | null;
  className?: string;
}) {
  const displayName = name.trim() || '—';
  const slotsLabel = slots ?? '-';

  return (
    <div className="flex min-w-0 items-center">
      <TooltipProvider delay={250}>
        <TooltipPrimitive>
          <TooltipTrigger
            closeOnClick={false}
            render={props => (
              <span {...props} className={cn('min-w-0 truncate font-semibold', className, props.className)}>
                {displayName}
              </span>
            )}
          />
          <TooltipContent>
            <span>
              {displayName} ({slotsLabel})
            </span>
          </TooltipContent>
        </TooltipPrimitive>
      </TooltipProvider>
      <span className={cn('shrink-0 font-semibold', className)}> ({slotsLabel})</span>
    </div>
  );
}
