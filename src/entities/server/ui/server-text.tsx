import { ServerStatus } from '@/shared/sdk/types';
import classNames from 'classnames';
import { FC } from 'react';
import { getServerStatusText } from '../lib';

export const ServerStatusText: FC<{
  status?: ServerStatus;
  className?: string;
}> = ({ status, className }) => {
  if (!status) return null;

  return (
    <span
      className={classNames(
        {
          'text-green-500': status === ServerStatus.ACTIVE,
          'text-red-500': status === ServerStatus.INACTIVE,
        },
        className,
      )}>
      {getServerStatusText(status)}
    </span>
  );
};
