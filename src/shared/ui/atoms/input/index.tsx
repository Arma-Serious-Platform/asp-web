import * as React from 'react';
import { cn } from '@/shared/utils/cn';
import { SearchIcon, X, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Calendar } from '@/shared/ui/atoms/calendar';
import { PopoverRoot, PopoverTrigger, PopoverContent } from '@/shared/ui/moleculas/popover';

import { formatNumericValue } from '@/shared/utils/string';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
      const formattedValue = formatNumericValue(initialValue, props.min, props.max, canBeZeroAtTheStart, float);

      e.target.value = formattedValue;

      if (onChange) onChange(e);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        onChange={onChangeValue}
        min={0}
        mapSetValue={value => formatNumericValue(value, props.min, props.max, canBeZeroAtTheStart, float)}
        {...props}
      />
    );
  },
);

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, value: propValue, onChange, searchIcon, closeIcon, error, mapSetValue, label, ...props },
    ref,
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
      <div className="relative w-full">
        {searchIcon && (
          <SearchIcon className={cn('absolute left-3 top-4.5 -translate-y-1/2 text-muted-foreground', 'h-4 w-4')} />
        )}

        {label && (
          <label
            className={cn(
              'absolute left-2 top-0 -translate-y-1/2 rounded-md border border-white/10 bg-neutral-800 px-2 text-xs font-medium text-zinc-100 shadow-sm',
            )}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
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
          className={cn(
            'flex h-9 w-full rounded-md border border-neutral-700 bg-black/70 px-2 py-1 text-sm text-zinc-100 shadow-sm transition-colors placeholder:text-zinc-500 focus-visible:border-lime-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/40 disabled:cursor-not-allowed disabled:opacity-45',
            {
              'pl-9': searchIcon,
            },
            className,
          )}
          {...props}
        />

        {value && closeIcon && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            onClick={e => {
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
          <p className="absolute -bottom-2 right-2 text-destructive bg-red-950 text-xs text-right px-2 rounded-lg">
            {error}
          </p>
        )}
      </div>
    );
  },
);

type DatePickerProps = Omit<InputProps, 'type' | 'onChange' | 'value'> & {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mode?: 'date' | 'datetime-local';
  placeholder?: string;
};

const DateInput = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ value, onChange, mode = 'date', placeholder, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined);

    React.useEffect(() => {
      if (value) {
        const parsedDate = new Date(value);
        if (!isNaN(parsedDate.getTime())) {
          setDate(parsedDate);
        }
      } else {
        setDate(undefined);
      }
    }, [value]);

    const formatDateForInput = (date: Date | undefined): string => {
      if (!date) return '';
      if (mode === 'datetime-local') {
        // Format as YYYY-MM-DDTHH:mm for datetime-local input
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      } else {
        // Format as YYYY-MM-DD for date input
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    };

    const handleDateSelect = (selectedDate: Date | undefined) => {
      setDate(selectedDate);
      if (selectedDate && onChange) {
        const formattedValue = formatDateForInput(selectedDate);
        onChange({
          target: { value: formattedValue },
        } as React.ChangeEvent<HTMLInputElement>);
        // Close popover for date mode, keep open for datetime-local to allow time selection
        if (mode === 'date') {
          setOpen(false);
        }
      } else if (!selectedDate && onChange) {
        onChange({
          target: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    };

    const displayValue = date ? format(date, mode === 'datetime-local' ? 'PPp' : 'dd.MM.yyyy', { locale: uk }) : '';

    return (
      <PopoverRoot open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Input
              ref={ref}
              type="text"
              readOnly
              value={displayValue}
              placeholder={placeholder || (mode === 'datetime-local' ? 'Оберіть дату та час' : 'Оберіть дату')}
              onClick={() => setOpen(true)}
              className={cn('cursor-pointer', props.className)}
              {...props}
            />
            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
          {mode === 'datetime-local' && date && (
            <div className="p-3 border-t border-neutral-700">
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={
                    date
                      ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
                      : ''
                  }
                  onChange={e => {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    if (!isNaN(hours) && !isNaN(minutes)) {
                      const newDate = new Date(date);
                      newDate.setHours(hours, minutes);
                      handleDateSelect(newDate);
                      setOpen(false);
                    }
                  }}
                  label="Час"
                  className="flex-1"
                />
              </div>
            </div>
          )}
        </PopoverContent>
      </PopoverRoot>
    );
  },
);

DateInput.displayName = 'DateInput';

Input.displayName = 'Input';
NumericInput.displayName = 'NumericInput';

export { Input, NumericInput, DateInput };
