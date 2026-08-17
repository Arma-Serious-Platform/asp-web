'use client';

import { Gamepad2Icon, LoaderIcon, MapIcon, ServerIcon, UsersIcon } from 'lucide-react';
import { FC, useEffect } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { View } from '@/features/view';
import { serverInfoState, ServerInfoState } from '../state/server-info.state';

export const ServerInfo: FC<{
  className?: string;
  state?: ServerInfoState;
}> = observer(({ className, state = serverInfoState }) => {
  useEffect(() => {
    state.fetchServers();
  }, [state]);

  const server = state.servers?.[0] || null;

  if (!server) {
    return (
      <div className={classNames('w-fit h-fit paper p-2.5 flex items-center justify-center animate-pulse', className)}>
        <LoaderIcon className="animate-spin" />
      </div>
    );
  }

  return (
    <div className={classNames('paper p-2.5 flex flex-col gap-1 h-fit w-fit rounded-sm', className)}>
      <div className="flex gap-2 items-center">
        <ServerIcon className="size-4" />
        <span className="text-ellipsis overflow-hidden whitespace-nowrap">{server?.name}</span> |{' '}
        <span className="text-primary">
          {server?.ip}:{server?.port}
        </span>
      </div>
      <View.Condition if={server?.info}>
        <div className="flex gap-2 items-center">
          <UsersIcon className="size-4" />
          <span className="text-primary">
            {server?.info?.players}/{server?.info?.maxPlayers}
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <MapIcon className="size-4" />
          <span>{server?.info?.map}</span>
        </div>
        <div className="flex gap-2 items-center">
          <Gamepad2Icon className="size-4" />
          <span>{server?.info?.game}</span>
        </div>
      </View.Condition>
    </div>
  );
});
