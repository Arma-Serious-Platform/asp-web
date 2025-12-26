'use client';

import { FC, ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  containerClassName?: string;
  background?: boolean;
  withCard?: boolean;
  children: ReactNode;
};

const Section: FC<SectionProps> = ({
  id,
  eyebrow,
  title,
  subtitle,
  className,
  containerClassName,
  background = false,
  children,
}) => {
  return (
    <section
      id={id}
      className={cn('w-full py-10', { 'bg-black/40': background })}>
      <div
        className={cn(
          'container mx-auto flex w-full flex-col gap-6 px-4',
          containerClassName
        )}>
        <div
          className={cn(
            'paper flex w-full flex-col gap-5 rounded-xl px-6 py-6 shadow-xl',
            className
          )}>
          {(eyebrow || title || subtitle) && (
            <header className='flex flex-col gap-2 max-lg:text-center'>
              {eyebrow && (
                <span className='text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400'>
                  {eyebrow}
                </span>
              )}
              {title && (
                <h2 className='text-3xl font-extrabold tracking-tight lg:text-4xl'>
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className='text-sm text-zinc-300 max-lg:text-center'>
                  {subtitle}
                </p>
              )}
            </header>
          )}

          {children}
        </div>
      </div>
    </section>
  );
};

export { Section };
