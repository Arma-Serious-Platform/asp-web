import * as React from 'react';
import { cn } from '@/shared/utils/cn';
import { Search, X } from 'lucide-react';

import { formatNumericValue } from '@/shared/utils/string';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: boolean;
  closeIcon?: boolean;
  error?: string;
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
      startIcon,
      closeIcon,
      error,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = React.useState(propValue || '');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (props.mapSetValue) {
        setValue(props.mapSetValue(e.target.value));
      } else {
        setValue(e.target.value);
      }

      if (onChange) onChange(e);
    };

    React.useEffect(() => {
      setValue(propValue || '');
    }, [propValue]);

    const height = className?.includes('h-7') ? 'h-7' : 'h-9';
    const isSmall = height === 'h-7';

    return (
      <div className='relative w-full'>
        {startIcon && (
          <Search
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground',
              isSmall ? 'h-3 w-3' : 'h-4 w-4'
            )}
          />
        )}

        <input
          type={type}
          value={value}
          onChange={handleChange}
          className={cn(
            'flex h-9 w-full focus:border border border-primary px-2 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-45 text-muted-foreground bg-accent/80',
            startIcon && isSmall ? 'pl-9' : '',
            value && closeIcon ? (isSmall ? 'pr-8' : 'pr-9') : '',
            className
          )}
          ref={ref}
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
            <X
              className={cn(
                'transition-colors',
                isSmall ? 'w-3 h-3' : 'w-4 h-4'
              )}
            />
          </button>
        )}

        {error && <p className='mt-1 text-red-500 text-sm'>{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
NumericInput.displayName = 'NumericInput';

export { Input, NumericInput };
