'use client';

import { DisconnectSteamModel } from '@/features/user/disconnect-steam/model';
import { DisconnectSteamModal } from '@/features/user/disconnect-steam/ui';
import { User } from '@/shared/sdk/types';
import { api } from '@/shared/sdk';
import { Button } from '@/shared/ui/atoms/button';
import { AlertTriangleIcon, TrashIcon, UnplugIcon, XIcon } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';
import { observer } from 'mobx-react-lite';

const STEAM_WARNING = "Увага! Без прив'язаного Steam Ви не зможете грати на сервері.";

const ProfileSteamConnect: FC<{
  user: User | null;
  disconnectModel: DisconnectSteamModel;
  onChanged?: () => void;
}> = observer(({ user, disconnectModel, onChanged }) => {
  if (!user) return null;

  return (
    <>
      <DisconnectSteamModal model={disconnectModel} onSuccess={onChanged} />

      {user.steamId ? (
        <div className="flex gap-2">
          <span className="text-sm text-zinc-200">{user.steamId}</span>
          <UnplugIcon
            className="size-4 cursor-pointer text-zinc-400 hover:text-destructive"
            onClick={() => disconnectModel.modal.open()}
          />
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            type="button"
            size="sm"
            className="flex shrink-0 items-center gap-2 border-0 bg-linear-to-r from-[#171a21] via-[#1b2838] to-[#2a475e] text-white hover:from-[#1b2838] hover:via-[#2a475e] hover:to-[#66c0f4]"
            onClick={() => {
              window.location.href = api.getSteamLoginUrl();
            }}>
            <Image src="/images/steam-logo.svg" width={20} height={20} alt="Steam" />
            Підключити Steam
          </Button>
          <p className="flex items-start gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] leading-snug text-amber-100/90">
            <AlertTriangleIcon className="mt-px size-3 shrink-0 text-amber-400" aria-hidden />
            <span>{STEAM_WARNING}</span>
          </p>
        </div>
      )}
    </>
  );
});

export { ProfileSteamConnect, STEAM_WARNING };
