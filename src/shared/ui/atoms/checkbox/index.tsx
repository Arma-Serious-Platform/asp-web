import { cn } from '@/shared/utils/cn';
import { CheckIcon } from 'lucide-react';
import { FC } from 'react';

export const Checkbox: FC<{
  className?: string;
  checked: boolean;
  onClick?: () => void;
}> = ({ checked, className, onClick }) => (
  <div
    className={cn(
      'size-4 border border-primary flex items-center justify-center cursor-pointer',
      {
        'hover:bg-primary/70': !checked,
        'bg-primary': checked,
      },
      className,
    )}
    onClick={onClick}>
    {checked && <CheckIcon className="size-3 text-white" />}
  </div>
);
