'use client';

import { Button } from '@/shared/ui/atoms/button';
import {
  AppWindowIcon,
  BellIcon,
  ChartBarIcon,
  LockKeyholeIcon,
  MessageCircleIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';
import { FC, PropsWithChildren } from 'react';
import { ProfileTab } from './user-profile';

type ProfileSidebarProps = {
  tab: ProfileTab;
  setTab: (tab: ProfileTab) => void;
  isOwnProfile: boolean;
  onMessage?: () => void;
};

export const ProfileSidebarCard: FC<PropsWithChildren<{ title: string }>> = ({ title, children }) => (
  <div className="flex flex-col gap-1 rounded-md border border-white/10 bg-black/60 p-1 text-xs">
    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-zinc-500">{title}</div>
    {children}
  </div>
);

export const ProfileSidebar = ({ tab, setTab, isOwnProfile, onMessage }: ProfileSidebarProps) => {
  return (
    <ProfileSidebarCard title="Профіль">
      <div className="flex flex-col gap-1">
        <Button
          size="sm"
          onClick={() => setTab(ProfileTab.PROFILE)}
          variant={tab === ProfileTab.PROFILE ? 'default' : 'ghost'}
          className="flex w-full items-center justify-start gap-2 text-xs">
          <UserIcon className="size-4" />
          <span>Основна інформація</span>
        </Button>
        <Button
          size="sm"
          onClick={() => setTab(ProfileTab.STATS)}
          variant={tab === ProfileTab.STATS ? 'default' : 'ghost'}
          className="flex w-full items-center justify-start gap-2 text-xs">
          <ChartBarIcon className="size-4" />
          <span>Статистика</span>
        </Button>
        {onMessage && (
          <Button
            size="sm"
            onClick={onMessage}
            variant="ghost"
            className="flex w-full items-center justify-start gap-2 text-xs">
            <MessageCircleIcon className="size-4" />
            <span>Написати</span>
          </Button>
        )}
        {isOwnProfile && (
          <>
            <Button
              size="sm"
              onClick={() => setTab(ProfileTab.CHAT)}
              variant={tab === ProfileTab.CHAT ? 'default' : 'ghost'}
              className="flex w-full items-center justify-start gap-2 text-xs">
              <MessageCircleIcon className="size-4" />
              <span>Чат</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setTab(ProfileTab.SQUAD)}
              variant={tab === ProfileTab.SQUAD ? 'default' : 'ghost'}
              className="flex w-full items-center justify-start gap-2 text-xs">
              <UsersIcon className="size-4" />
              <span>Мій загін</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setTab(ProfileTab.NOTIFICATIONS)}
              variant={tab === ProfileTab.NOTIFICATIONS ? 'default' : 'ghost'}
              className="flex w-full items-center justify-start gap-2 text-xs">
              <BellIcon className="size-4" />
              <span>Нотифікації</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setTab(ProfileTab.SECURITY)}
              variant={tab === ProfileTab.SECURITY ? 'default' : 'ghost'}
              className="flex w-full items-center justify-start gap-2 text-xs">
              <LockKeyholeIcon className="size-4" />
              <span>Безпека</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setTab(ProfileTab.APPS)}
              variant={tab === ProfileTab.APPS ? 'default' : 'ghost'}
              className="flex w-full items-center justify-start gap-2 text-xs">
              <AppWindowIcon className="size-4" />
              <span>Підключені додатки</span>
            </Button>
          </>
        )}
      </div>
    </ProfileSidebarCard>
  );
};
