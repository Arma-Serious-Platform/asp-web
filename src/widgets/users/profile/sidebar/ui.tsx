'use client';

import { Button } from '@/shared/ui/atoms/button';
import {
  LockKeyholeIcon,
  MessageCircleIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';
import { ProfileTab } from '../lib';

type ProfileSidebarProps = {
  tab: ProfileTab;
  setTab: (tab: ProfileTab) => void;
  isOwnProfile: boolean;
};

export const ProfileSidebar = ({
  tab,
  setTab,
  isOwnProfile,
}: ProfileSidebarProps) => {
  return (
    <div className='flex flex-col gap-1 rounded-md border border-white/10 bg-black/60 p-1 text-xs'>
      <div className='px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-zinc-500'>
        Профіль
      </div>
      <div className='flex flex-col gap-1'>
        <Button
          size='sm'
          onClick={() => setTab(ProfileTab.PROFILE)}
          variant={tab === ProfileTab.PROFILE ? 'default' : 'ghost'}
          className='flex w-full items-center justify-start gap-2 text-xs'>
          <UserIcon className='size-4' />
          <span>Основна інформація</span>
        </Button>
        {isOwnProfile && (
          <>
            <Button
              size='sm'
              onClick={() => setTab(ProfileTab.SQUAD)}
              variant={tab === ProfileTab.SQUAD ? 'default' : 'ghost'}
              className='flex w-full items-center justify-start gap-2 text-xs'>
              <UsersIcon className='size-4' />
              <span>Мій загін</span>
            </Button>
            <Button
              size='sm'
              onClick={() => setTab(ProfileTab.SECURITY)}
              variant={tab === ProfileTab.SECURITY ? 'default' : 'ghost'}
              className='flex w-full items-center justify-start gap-2 text-xs'>
              <LockKeyholeIcon className='size-4' />
              <span>Безпека</span>
            </Button>
          </>
        )}
        {!isOwnProfile && (
          <>
            <Button size='sm' variant='ghost' className='justify-start text-xs'>
              <MessageCircleIcon className='size-4' /> <span>Написати</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
