import { cn } from '@/shared/utils/cn';

import { CalendarIcon, Clock4Icon } from 'lucide-react';
import { FC } from 'react';

export const ScheduleInfo: FC<{
  className?: string;
  version?: 'full' | 'short';
  plain?: boolean;
}> = ({ className, version = 'full', plain = false }) => {
  return (
    <div className={cn('flex gap-2 items-center', !plain && 'paper px-2 py-1 ml-4 rounded-lg', className)}>
      <div className="flex gap-2 items-center">
        <CalendarIcon className="size-4 shrink-0" />
        {version === 'full' && <span className="whitespace-nowrap text-xs">П&apos;ятниця та неділя</span>}
        {version === 'short' && <span className="text-xs whitespace-nowrap">ПТ та НД</span>}
      </div>
      <div className="flex gap-2 items-center text-xs">
        <Clock4Icon className="size-4 shrink-0" />
        {version === 'full' && <span className="whitespace-nowrap text-xs">19:30 по Києву</span>}
        {version === 'short' && <span className="text-xs whitespace-nowrap">19:30</span>}
      </div>
    </div>
  );
};
