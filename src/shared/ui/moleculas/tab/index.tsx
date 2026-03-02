import { FC, ReactNode } from 'react';
import classNames from 'classnames';
import { cn } from '@/shared/utils/cn';

export type TabProps = {
  title: ReactNode;
  index?: number;
  isActive: boolean;
  className?: string;
  onClick: () => void;
};

export const Tab: FC<TabProps> = ({ className, title, index, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'relative flex w-full px-4 py-2 text-sm font-medium transition-colors border-b-2 z-10 cursor-pointer',
      {
        'bg-lime-700 text-white border-lime-600': isActive,
        'bg-black/40 text-white border-transparent hover:bg-lime-700 hover:border-lime-600': !isActive,
      },
      className,
    )}>
    {typeof index === 'number' ? `${index + 1}. ` : ''}
    {title}
  </button>
);
