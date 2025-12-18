import { FC } from 'react';
import classNames from 'classnames';
import { cn } from '@/shared/utils/cn';

export type TabProps = {
  title: string;
  index: number;
  isActive: boolean;
  className?: string;
  onClick: () => void;
};

export const Tab: FC<TabProps> = ({
  className,
  title,
  index,
  isActive,
  onClick,
}) => (
  <div className={cn('relative flex w-full', className)}>
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 text-sm font-medium transition-colors border-b-2 relative z-10 cursor-pointer w-full',
        {
          'bg-lime-700 text-white border-lime-600': isActive,
          'bg-black/40 text-white border-transparent hover:bg-black/50':
            !isActive,
        }
      )}>
      {index + 1}. {title}
    </button>
  </div>
);
