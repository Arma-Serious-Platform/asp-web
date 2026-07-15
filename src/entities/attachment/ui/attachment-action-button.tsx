'use client';

import { FC, ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

type AttachmentActionButtonProps = {
  label: string;
  onClick: () => void;
  children: ReactNode;
  className?: string;
};

export const AttachmentActionButton: FC<AttachmentActionButtonProps> = ({
  label,
  onClick,
  children,
  className,
}) => (
  <button
    type="button"
    className={cn(
      'cursor-pointer rounded-full border border-white/20 bg-black/70 p-2 text-white transition-colors hover:bg-black/90',
      className,
    )}
    onClick={onClick}
    aria-label={label}>
    {children}
  </button>
);
