import { cn } from '@/shared/utils/cn';
import { CheckIcon } from 'lucide-react';
import { FC } from 'react';

export const Checkbox: FC<{
  className?: string;
  checked: boolean;
}> = ({ checked, className }) => (
  <div
    className={cn(
      'size-4 border border-primary flex items-center justify-center',
      className
    )}>
    {checked && <CheckIcon className='size-2 text-primary' />}
  </div>
);
