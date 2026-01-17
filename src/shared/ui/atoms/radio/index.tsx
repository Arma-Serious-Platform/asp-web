import { cn } from '@/shared/utils/cn';
import { FC } from 'react';

export const Radio: FC<{
  className?: string;
  checked: boolean;
}> = ({ checked, className }) => (
  <div className={cn('size-4 flex items-center justify-center rounded-full border border-primary', className)}>
    {checked && <div className="size-2 rounded-full bg-primary" />}
  </div>
);
