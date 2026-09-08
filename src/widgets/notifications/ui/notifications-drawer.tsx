'use client';

import { observer } from 'mobx-react-lite';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/ui/organisms/drawer';
import { notificationsState, type NotificationFilter } from '../state/notifications.state';
import {
  ALL_NOTIFICATION_GROUPS,
  NOTIFICATION_GROUP_LABELS,
  NOTIFICATION_TYPE_LABELS,
  getNotificationDescription,
  getNotificationHref,
} from '@/entities/notification';
import { NotificationGroup } from '@/shared/sdk/notifications/notifications.schemas';
import { Button } from '@/shared/ui/atoms/button';
import { LoaderIcon } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import { UserNicknameText } from '@/entities/user/ui/user-text';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/utils/cn';

const FILTERS: { key: NotificationFilter; label: string }[] = [
  { key: 'ALL', label: 'Усі' },
  ...ALL_NOTIFICATION_GROUPS.map(group => ({
    key: group as NotificationFilter,
    label: NOTIFICATION_GROUP_LABELS[group],
  })),
];

export const NotificationsDrawer = observer(() => {
  const router = useRouter();
  const { items, filter, listPreloader, unreadTotal, unreadByGroup } = notificationsState;

  const handleOpen = async (id: string, href: string | null) => {
    await notificationsState.markAsRead(id);
    notificationsState.closeDrawer();
    if (href) {
      router.push(href);
    }
  };

  return (
    <Drawer open={notificationsState.isDrawerOpen} onOpenChange={notificationsState.setDrawerOpen}>
      <DrawerContent className="max-w-lg sm:max-w-xl">
        <DrawerHeader className="pr-10">
          <DrawerTitle>Нотифікації</DrawerTitle>
        </DrawerHeader>

        <DrawerBody className="gap-3">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map(item => {
              const unread =
                item.key === 'ALL'
                  ? unreadTotal
                  : unreadByGroup[item.key as NotificationGroup] ?? 0;

              return (
                <Button
                  key={item.key}
                  size="sm"
                  variant={filter === item.key ? 'default' : 'outline'}
                  className="h-7 px-2 text-[11px]"
                  onClick={() => notificationsState.setFilter(item.key)}>
                  {item.label}
                  {unread > 0 ? ` (${unread})` : ''}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500">
              {filter === 'ALL' ? 'Усі групи' : NOTIFICATION_GROUP_LABELS[filter]}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-zinc-300"
              onClick={() => void notificationsState.markAllAsRead()}>
              Прочитати усі
            </Button>
          </div>

          {listPreloader.isLoading && (
            <div className="flex items-center justify-center py-10 text-zinc-400">
              <LoaderIcon className="size-5 animate-spin" />
            </div>
          )}

          {!listPreloader.isLoading && items.length === 0 && (
            <div className="rounded-md border border-white/10 bg-black/40 px-3 py-8 text-center text-sm text-zinc-400">
              Немає нотифікацій
            </div>
          )}

          {!listPreloader.isLoading && items.length > 0 && (
            <div className="flex flex-col gap-2">
              {items.map(notification => {
                const href = getNotificationHref(notification);
                const description = getNotificationDescription(notification);
                const isUnread = !notification.readAt;

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'rounded-md border border-white/10 bg-black/40 p-3 transition-colors',
                      isUnread && 'border-primary/30 bg-primary/5',
                    )}>
                    <button
                      type="button"
                      className="w-full cursor-pointer text-left"
                      onClick={() => void handleOpen(notification.id, href)}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-zinc-100">
                            {NOTIFICATION_TYPE_LABELS[notification.type]}
                          </div>
                          {notification.actor && (
                            <div className="mt-0.5 text-[11px] text-zinc-400">
                              від{' '}
                              <UserNicknameText
                                user={notification.actor}
                                link={false}
                                className="text-zinc-300"
                              />
                            </div>
                          )}
                          {description && (
                            <div className="mt-1 line-clamp-2 text-xs text-zinc-300">{description}</div>
                          )}
                        </div>
                        <div className="shrink-0 text-[10px] text-zinc-500">
                          {dayjs(notification.createdAt).locale('uk').format('DD.MM HH:mm')}
                        </div>
                      </div>
                    </button>

                    {isUnread && (
                      <div className="mt-2 flex justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={event => {
                            event.stopPropagation();
                            void notificationsState.markAsRead(notification.id);
                          }}>
                          Прочитано
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
});
