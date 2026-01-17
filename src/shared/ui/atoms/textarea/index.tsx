import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, value: propValue, onChange, error, label, rows = 4, ...props }, ref) => {
    const [value, setValue] = React.useState(propValue || '');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);

      if (onChange) onChange(e);
    };

    React.useEffect(() => {
      setValue(propValue || '');
    }, [propValue]);

    const [isFocused, setIsFocused] = React.useState(props.autoFocus || false);

    return (
      <div className="relative w-full">
        {label && (
          <label
            className={cn(
              'absolute left-2 top-0 -translate-y-1/2 rounded-md border border-white/10 bg-neutral-800 px-2 text-xs font-medium text-zinc-100 shadow-sm',
            )}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          value={value}
          onChange={handleChange}
          onFocus={e => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={e => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          rows={rows}
          className={cn(
            'flex w-full rounded-md border border-neutral-700 bg-black/70 px-2 py-2 text-sm text-zinc-100 shadow-sm transition-colors placeholder:text-zinc-500 focus-visible:border-lime-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/40 disabled:cursor-not-allowed disabled:opacity-45 resize-y',
            className,
          )}
          {...props}
        />

        {error && (
          <p className="absolute -translate-y-1/2 top-0 right-2 text-destructive bg-red-950 text-xs text-right px-2 rounded-lg">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export { Textarea };
