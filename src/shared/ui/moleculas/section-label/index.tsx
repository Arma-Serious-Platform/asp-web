import { FC, ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

type SectionLabelProps = {
  children: ReactNode;
  className?: string;
};

const SectionLabel: FC<SectionLabelProps> = ({ children, className }) => (
  <span className={cn('text-xs font-semibold uppercase tracking-[0.26em] text-zinc-500', className)}>{children}</span>
);

export { SectionLabel };
