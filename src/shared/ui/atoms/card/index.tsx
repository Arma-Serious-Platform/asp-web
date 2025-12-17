import { FC, ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

export type CardProps = {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated';
};

export const Card: FC<CardProps> = ({
  children,
  className,
  variant = 'default',
}) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-white/10 backdrop-blur-sm',
        {
          'bg-black/40 p-4': variant === 'default',
          'bg-black/50 p-4 shadow-lg': variant === 'elevated',
        },
        className
      )}>
      {children}
    </div>
  );
};

