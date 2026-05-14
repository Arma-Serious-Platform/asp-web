'use client';

import { ReactNode, useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

import { Button } from '@/shared/ui/atoms/button';
import { cn } from '@/shared/utils/cn';

type RevealableBlurredTextProps = {
  /** Sensitive content (e.g. email). */
  children: ReactNode;
  /** Initial visibility; default is hidden (blurred). */
  defaultRevealed?: boolean;
  className?: string;
  /** Applied to the text wrapper. */
  textClassName?: string;
  /** Shown in `aria-label` when content is hidden (defaults to «Показати»). */
  revealLabel?: string;
  /** Shown in `aria-label` when content is visible (defaults to «Приховати»). */
  hideLabel?: string;
  /** Overrides `aria-label` on the toggle (e.g. longer description for assistive tech). */
  toggleAriaLabel?: string;
};

const RevealableBlurredText = ({
  children,
  defaultRevealed = false,
  className,
  textClassName,
  revealLabel = 'Показати',
  hideLabel = 'Приховати',
  toggleAriaLabel,
}: RevealableBlurredTextProps) => {
  const [revealed, setRevealed] = useState(defaultRevealed);
  const blurred = !revealed;

  const ariaLabel = toggleAriaLabel ?? (revealed ? hideLabel : revealLabel);

  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-2', className)}>
      <span
        className={cn(
          'min-w-0 flex-1 break-all text-zinc-200 transition-[filter,opacity] duration-200',
          blurred && 'blur-sm select-none opacity-90',
          textClassName,
        )}
        aria-hidden={blurred}>
        {children}
      </span>
      {blurred ? (
        <span className="sr-only">Значення приховано. Натисніть кнопку з іконкою ока, щоб показати.</span>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 shrink-0 text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
        aria-label={ariaLabel}
        aria-pressed={revealed}
        onClick={() => setRevealed(v => !v)}>
        {revealed ? <EyeOffIcon className="size-4" aria-hidden /> : <EyeIcon className="size-4" aria-hidden />}
      </Button>
    </div>
  );
};

export { RevealableBlurredText };
