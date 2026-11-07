'use client';

import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { FC, ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

type AccordionToggleProps = {
  isOpen: boolean;
  onToggle: () => void;
  title: ReactNode;
  icon?: ReactNode;
  meta?: ReactNode;
  className?: string;
};

export const AccordionToggle: FC<AccordionToggleProps> = ({ isOpen, onToggle, title, icon, meta, className }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={isOpen}
    className={cn(
      'flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-2 text-left transition-colors hover:border-lime-500/40 hover:bg-white/10',
      className,
    )}>
    <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-zinc-100">
      {icon && <span className="flex shrink-0 text-lime-500 [&>svg]:size-4">{icon}</span>}
      <span className="min-w-0 break-words">{title}</span>
      {meta && <span className="shrink-0 font-medium text-zinc-300">{meta}</span>}
    </span>
    {isOpen ? (
      <ChevronUpIcon className="size-4 shrink-0 text-zinc-200" />
    ) : (
      <ChevronDownIcon className="size-4 shrink-0 text-zinc-200" />
    )}
  </button>
);
