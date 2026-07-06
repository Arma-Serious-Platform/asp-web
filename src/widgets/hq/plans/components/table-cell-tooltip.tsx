'use client';

import { ReactNode } from 'react';

import { TooltipContent, TooltipPrimitive, TooltipProvider, TooltipTrigger } from '@/shared/ui/moleculas/tooltip';
import { cn } from '@/shared/utils/cn';

import { tableFieldTooltipContentClass } from '../lib';

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
