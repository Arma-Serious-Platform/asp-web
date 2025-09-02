import { SideType } from '@/shared/sdk/types';
import { cn } from '@/shared/utils/cn';
import { FC } from 'react';
import { getSideTypeText } from '../../lib';

export const SideTypeText: FC<{
  type: SideType;
}> = ({ type }) => {
  return (
    <span
      className={cn({
        'text-blue-500': type === SideType.BLUE,
        'text-red-500': type === SideType.RED,
        'text-gray-500': type === SideType.UNASSIGNED,
      })}>
      {getSideTypeText(type)}
    </span>
  );
};
