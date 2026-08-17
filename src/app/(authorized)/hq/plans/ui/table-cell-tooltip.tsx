'use client';

import { ReactNode } from 'react';

import { TooltipContent, TooltipPrimitive, TooltipProvider, TooltipTrigger } from '@/shared/ui/moleculas/tooltip';
import { cn } from '@/shared/utils/cn';

const tableFieldTooltipContentClass =
  'block max-h-48 max-w-[min(24rem,85vw)] overflow-y-auto whitespace-pre-wrap wrap-break-word text-left';

export function TableCellTooltip({ text, children }: { text: string; children: ReactNode }) {
  const display = text.trim() ? text : '—';

  return (
    <TooltipProvider delay={250}>
      <TooltipPrimitive>
        <TooltipTrigger
          closeOnClick={false}
          render={props => (
            <div {...props} className={cn('block w-full min-w-0 text-left', props.className)}>
              {children}
            </div>
          )}
        />
        <TooltipContent>
          <span className={tableFieldTooltipContentClass}>{display}</span>
        </TooltipContent>
      </TooltipPrimitive>
    </TooltipProvider>
  );
}
