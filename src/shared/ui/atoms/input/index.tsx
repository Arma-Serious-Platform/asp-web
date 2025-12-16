import * as React from 'react';
import { cn } from '@/shared/utils/cn';
import { SearchIcon, X } from 'lucide-react';

import { formatNumericValue } from '@/shared/utils/string';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  searchIcon?: boolean;
  closeIcon?: boolean;
  error?: string;
  label?: string;
  mapSetValue?: (value: string) => string;
}

type NumericInputProps = InputProps & {
  canBeZeroAtTheStart?: boolean;
  float?: number;
};

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ onChange, canBeZeroAtTheStart = true, float, ...props }, ref) => {
    const onChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
      const initialValue = e.target.value;
      const formattedValue = formatNumericValue(
        initialValue,
        props.min,
        props.max,
        canBeZeroAtTheStart,
        float
      );

      e.target.value = formattedValue;

      if (onChange) onChange(e);
    };

    return (
      <Input
        ref={ref}
        type='text'
        inputMode='decimal'
        onChange={onChangeValue}
        min={0}
        mapSetValue={(value) =>
          formatNumericValue(
            value,
            props.min,
            props.max,
            canBeZeroAtTheStart,
            float
          )
        }
        {...props}
      />
    );
  }
);

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      value: propValue,
      onChange,
      searchIcon,
      closeIcon,
      error,
      mapSetValue,
      label,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = React.useState(propValue || '');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (mapSetValue) {
        setValue(mapSetValue(e.target.value));
      } else {
        setValue(e.target.value);
      }

      if (onChange) onChange(e);
    };

    React.useEffect(() => {
      setValue(propValue || '');
    }, [propValue]);

    const [isFocused, setIsFocused] = React.useState(props.autoFocus || false);

    return (
      <div className='relative w-full'>
        {searchIcon && (
          <SearchIcon
            className={cn(
              'absolute left-3 top-4.5 -translate-y-1/2 text-muted-foreground',
              'h-4 w-4'
            )}
          />
        )}

        {label && (
          <label
            className={cn(
              'absolute left-2 -translate-y-1/2 text-muted-foreground transition-transform text-foreground top-0 bg-primary px-2 text-xs rounded-lg'
            )}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            'rounded-lg outline-none focus:outline-none flex h-9 w-full border border-primary px-2 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45 text-muted-foreground bg-accent/80',
            {
              'pl-9': searchIcon,
            },
            className
          )}
          {...props}
        />

        {value && closeIcon && (
          <button
            type='button'
            className='absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground'
            onClick={(e) => {
              e.preventDefault();

              setValue('');
              if (onChange)
                onChange({
                  target: { value: '' },
                } as React.ChangeEvent<HTMLInputElement>);
            }}>
            <X className={cn('transition-colors', 'w-4 h-4')} />
          </button>
        )}

        {error && (
          <p className='absolute -translate-y-1/2 top-0 right-2 text-destructive bg-red-950 text-xs text-right px-2 rounded-lg'>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
NumericInput.displayName = 'NumericInput';

export { Input, NumericInput };
