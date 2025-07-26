'use client';

import { Gamepad2Icon, MapIcon, ServerIcon, UsersIcon } from 'lucide-react';
import { FC, useEffect } from 'react';
import { serverInfo, ServerInfoModel } from './model';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

export const ServerInfo: FC<{
  className?: string;
  model?: ServerInfoModel;
}> = observer(({ className, model = serverInfo }) => {
  useEffect(() => {
    model.fetchServers();
  }, []);

  const server = model.servers?.[0] || null;

  return (
    <div
      className={classNames(
        'border border-primary p-2.5 flex flex-col gap-1 w-full max-w-[350px]',
        className
      )}>
      <div className='flex gap-2 items-center'>
        <ServerIcon className='size-4' />
        <span>{server?.name}</span> |{' '}
        <span className='text-primary'>
          {server?.ip}:{server?.port}
        </span>
      </div>
      <div className='flex gap-2 items-center'>
        <UsersIcon className='size-4' />
        <span className='text-primary'>
          {server?.info?.players}/{server?.info?.maxPlayers}
        </span>
      </div>
      <div className='flex gap-2 items-center'>
        <MapIcon className='size-4' />
        <span>{server?.info?.map}</span>
      </div>
      <div className='flex gap-2 items-center'>
        <Gamepad2Icon className='size-4' />
        <span>{server?.info?.game}</span>
      </div>
    </div>
  );
});
