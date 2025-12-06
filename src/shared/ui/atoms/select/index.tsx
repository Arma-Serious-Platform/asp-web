import { FC, ReactNode, useMemo, useState } from 'react';
import { Popover } from '../../moleculas/popover';

import { Radio } from '../radio';
import { Checkbox } from '../checkbox';

import { Input } from '../input';
import { cn } from '@/shared/utils/cn';
import { Preloader } from '../preloader';
import { useDebounce } from 'react-use';
import { ChevronDownIcon } from 'lucide-react';

export type SelectOption = {
  label: string;
  value: string;
};

type BaseSelectProps = {
  options: SelectOption[];
  isLoading?: boolean;
  error?: string;
  children?: React.ReactNode;
  label?: ReactNode;
  onSearch?: (value: string) => void;
};

type SingleSelectProps = BaseSelectProps & {
  multiple?: false;
  value: string | null;
  onChange: (value: string | null) => void;
};

type MultipleSelectProps = BaseSelectProps & {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
};

const Select: FC<SingleSelectProps | MultipleSelectProps> = ({
  isLoading,
  label,
  children,
  error,
  multiple,
  options,
  value,
  onSearch,
  onChange,
}) => {
  const [savedOptions, setSavedOptions] = useState<SelectOption[]>([]);

  const onSelect = (option: SelectOption) => {
    const isAlreadySelected = savedOptions.some(
      (o) => o.value === option.value
    );

    if (multiple) {
      setSavedOptions(
        isAlreadySelected
          ? [...savedOptions.filter((o) => o.value !== option.value)]
          : [...savedOptions, option]
      );
      onChange(savedOptions.map((o) => o.value));
    } else {
      setSavedOptions(isAlreadySelected ? [] : [option]);
      onChange(value === option.value ? null : option.value);
    }
  };

  const combinedOptions = useMemo(() => {
    return [
      ...options,
      ...savedOptions.filter(
        (o) => !options.some((o2) => o2.value === o.value)
      ),
    ];
  }, [options, savedOptions]);

  return (
    <Popover
      className='p-0'
      trigger={
        children ? (
          children
        ) : (
          <div className='relative flex flex-col w-full'>
            {label && (
              <div className='bg-primary px-2 text-xs rounded-lg text-muted-foreground/50 absolute left-2 top-0 -translate-y-1/2'>
                {label}
              </div>
            )}
            <div
              className={cn(
                'cursor-pointer flex items-center text-muted-foreground/50 h-9 w-full focus:border border border-primary px-2 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-45 text-muted-foreground bg-accent/80 hover:bg-primary/15 rounded-sm',
                { 'text-muted-foreground/50': !value || !value.length }
              )}>
              {multiple
                ? combinedOptions
                    .filter((v) => value?.includes(v.value))
                    .map((v) => v.label)
                    .join(', ')
                : combinedOptions.find((v) => v.value === value)?.label}

              <ChevronDownIcon className='size-4 ml-auto' />
            </div>
            {error && (
              <p className='absolute -translate-y-1/2 top-0 right-2 text-destructive bg-red-950 text-xs text-right px-2 rounded-lg'>
                {error}
              </p>
            )}
          </div>
        )
      }>
      <div className='flex flex-col w-full'>
        {onSearch && (
          <Input
            className='border-t-0 border-b-1 border-x-0 outline-0'
            placeholder='Пошук'
            searchIcon
            error={error}
            onChange={(e) => onSearch(e.target.value)}
          />
        )}
        <Preloader isLoading={isLoading || false}>
          <div className='flex flex-col w-full'>
            {!combinedOptions.length && (
              <div className='p-8 h-8 mx-auto flex items-center justify-between text-sm'>
                {!isLoading && 'Результатів не знайдено'}
              </div>
            )}
            {combinedOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => onSelect(option)}
                className='cursor-pointer hover:bg-primary/15 px-2 py-1.5 text-sm'>
                {multiple ? (
                  <div className='flex items-center gap-2'>
                    <Checkbox checked={value.some((v) => v === option.value)} />
                    {option.label}
                  </div>
                ) : (
                  <div className='flex items-center gap-2'>
                    <Radio checked={value === option.value} />
                    {option.label}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Preloader>
      </div>
    </Popover>
  );
};

export { Select };
