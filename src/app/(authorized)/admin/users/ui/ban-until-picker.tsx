'use client';

import { Calendar } from '@/shared/ui/atoms/calendar';
import { Input } from '@/shared/ui/atoms/input';
import { PopoverContent, PopoverRoot, PopoverTrigger } from '@/shared/ui/moleculas/popover';
import { cn } from '@/shared/utils/cn';
import dayjs from 'dayjs';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { FC, ReactNode, useMemo, useState } from 'react';

const ALL_BAN_HOURS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'));

const getAvailableBanHours = (date: Date | undefined) => {
  if (!date) return ALL_BAN_HOURS;

  const now = dayjs();

  return ALL_BAN_HOURS.filter(hour =>
    dayjs(date).hour(Number(hour)).minute(0).second(0).millisecond(0).isAfter(now),
  );
};

const snapHourToAvailable = (hour: string, availableHours: string[]) => {
  if (availableHours.includes(hour)) return hour;

  return availableHours.find(option => Number(option) >= Number(hour)) ?? availableHours.at(-1) ?? hour;
};

export const getBanUntilDate = (date: Date | undefined, hour: string) => {
  if (!date || !hour) return null;

  return dayjs(date).hour(Number(hour)).minute(0).second(0).millisecond(0).toDate();
};

type BanUntilPickerProps = {
  date: Date | undefined;
  hour: string;
  onDateChange: (date: Date | undefined) => void;
  onHourChange: (hour: string) => void;
};

const PickerTrigger: FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  value: string;
  placeholder: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}> = ({ open, onOpenChange, label, value, placeholder, icon, children, className, contentClassName }) => (
  <PopoverRoot open={open} onOpenChange={onOpenChange}>
    <PopoverTrigger asChild>
      <div className={cn('relative w-full', className)}>
        <Input
          readOnly
          label={label}
          value={value}
          placeholder={placeholder}
          className="cursor-pointer pr-9"
          onClick={() => onOpenChange(true)}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
      </div>
    </PopoverTrigger>
    <PopoverContent align="start" className={cn('w-auto p-0', contentClassName)}>
      {children}
    </PopoverContent>
  </PopoverRoot>
);

export const BanUntilPicker: FC<BanUntilPickerProps> = ({ date, hour, onDateChange, onHourChange }) => {
  const [dateOpen, setDateOpen] = useState(false);
  const [hourOpen, setHourOpen] = useState(false);
  const availableHours = useMemo(() => getAvailableBanHours(date), [date]);

  return (
    <div className="flex flex-wrap items-start gap-2">
      <PickerTrigger
        open={dateOpen}
        onOpenChange={setDateOpen}
        label="Дата"
        value={date ? dayjs(date).format('DD.MM.YYYY') : ''}
        placeholder="Оберіть дату"
        icon={<CalendarIcon className="h-4 w-4" />}
        className="min-w-48 flex-1">
        <Calendar
          mode="single"
          selected={date}
          onSelect={selectedDate => {
            onDateChange(selectedDate);
            if (!selectedDate) return;

            onHourChange(snapHourToAvailable(hour, getAvailableBanHours(selectedDate)));
            setDateOpen(false);
          }}
          disabled={{ before: dayjs().startOf('day').toDate() }}
        />
      </PickerTrigger>

      <PickerTrigger
        open={hourOpen}
        onOpenChange={setHourOpen}
        label="Година"
        value={hour ? `${hour}:00` : ''}
        placeholder="Оберіть годину"
        icon={<ClockIcon className="h-4 w-4" />}
        className="w-34 shrink-0"
        contentClassName="w-34">
        <div className="flex max-h-60 flex-col overflow-y-auto overscroll-contain">
          {availableHours.length ? (
            availableHours.map(option => {
              const isSelected = hour === option;

              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={isSelected}
                  className={cn(
                    'px-3 py-1.5 text-left text-sm text-zinc-100 transition-colors hover:bg-lime-700/20',
                    isSelected && 'bg-lime-700 text-white hover:bg-lime-700',
                  )}
                  onClick={() => {
                    onHourChange(option);
                    setHourOpen(false);
                  }}>
                  {option}:00
                </button>
              );
            })
          ) : (
            <div className="px-3 py-4 text-center text-xs text-zinc-500">Немає доступних годин</div>
          )}
        </div>
      </PickerTrigger>
    </div>
  );
};
