import { FC, ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

export type TabProps = {
  title: ReactNode;
  /** Decorative layer behind the title (non-interactive, non-selectable). */
  watermark?: ReactNode;
  watermarkClassName?: string;
  isActive: boolean;
  className?: string;
  onClick: () => void;
};

export const Tab: FC<TabProps> = ({
  className,
  title,
  watermark,
  watermarkClassName,
  isActive,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'relative z-10 flex w-full cursor-pointer items-center overflow-hidden border-b-2 px-4 py-2 text-sm font-medium transition-colors',
      {
        'border-lime-500 bg-lime-700 text-white': isActive,
        'border-transparent bg-black/40 text-white hover:border-lime-600 hover:bg-lime-700/80': !isActive,
      },
      className,
    )}>
    {watermark != null && (
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 flex select-none items-center justify-center',
          watermarkClassName,
        )}>
        {watermark}
      </span>
    )}
    <span className="relative z-10 truncate text-left">{title}</span>
  </button>
);
