'use client';

import { observer } from 'mobx-react-lite';
import { BellIcon } from 'lucide-react';
import { notificationsState } from '../state/notifications.state';
import { NotificationsDrawer } from './notifications-drawer';
import { useEffect } from 'react';
import { cn } from '@/shared/utils/cn';
import { session } from '@/entities/session/session.state';
import { Button } from '@/shared/ui/atoms/button';

export const NotificationsBell = observer(() => {
  const isAuthorized = session.isAuthorized;

  useEffect(() => {
    if (!isAuthorized) {
      notificationsState.disconnectRealtime();
      return;
    }

    void notificationsState.loadUnreadCount();
    notificationsState.connectRealtime();
  }, [isAuthorized]);

  const unread = notificationsState.unreadTotal;

  return (
    <>
      <Button type="button" variant="ghost" size="icon" onClick={() => notificationsState.openDrawer()}>
        <BellIcon className="size-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </Button>
      <NotificationsDrawer />
    </>
  );
});
