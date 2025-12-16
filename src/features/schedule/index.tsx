import { cn } from '@/shared/utils/cn';

import { CalendarIcon, Clock4Icon } from 'lucide-react';
import { FC } from 'react';

export const ScheduleInfo: FC<{
  className?: string;
  version?: 'full' | 'short';
}> = ({ className, version = 'full' }) => {
  return (
    <div
      className={cn(
        'paper px-2 py-1 flex gap-2 items-center ml-4 rounded-lg',
        className
      )}>
      <div className='flex gap-2 items-center'>
        <CalendarIcon className='size-4 shrink-0' />
        {version === 'full' && <span className='whitespace-nowrap'>П&apos;ятниця та неділя</span>}
        {version === 'short' && <span className='text-xs whitespace-nowrap'>ПТ та НД</span>}
      </div>
      <div className='flex gap-2 items-center'>
        <Clock4Icon className='size-4 shrink-0' />
        {version === 'full' && <span className='whitespace-nowrap'>19:30 по Києву</span>}
        {version === 'short' && <span className='text-xs whitespace-nowrap'>19:30</span>}
      </div>
    </div>
  );
};
