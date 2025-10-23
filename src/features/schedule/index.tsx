import { cn } from '@/shared/utils/cn';

import { CalendarIcon, Clock4Icon } from 'lucide-react';
import { FC } from 'react';

export const ScheduleInfo: FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <div
      className={cn(
        'border border-primary px-2 py-1 flex gap-2 items-center ml-4',
        className
      )}>
      <div className='flex gap-2 items-center'>
        <CalendarIcon className='size-4' />
        <span>П&apos;ятниця та неділя</span>
      </div>
      <div className='flex gap-2 items-center'>
        <Clock4Icon className='size-4' />
        <span>19:30 по Києву</span>
      </div>
    </div>
  );
};
