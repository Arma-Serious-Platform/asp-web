import { makeAutoObservable, runInAction } from 'mobx';
import { io, type Socket } from 'socket.io-client';
import {
  NotificationGroup,
  type Notification,
  type NotificationPreferenceItem,
} from '@/shared/sdk/notifications/notifications.schemas';
import { notificationsApi } from '@/shared/sdk';
import { Preloader } from '@/shared/state/loader';
import { env } from '@/shared/config/env';
import toast from 'react-hot-toast';

export type NotificationFilter = 'ALL' | NotificationGroup;

let notificationsSocket: Socket | null = null;

export type NotificationFilter = 'ALL' | NotificationGroup;

class NotificationsState {
  isDrawerOpen = false;
  filter: NotificationFilter = 'ALL';
  items: Notification[] = [];
  total = 0;
  unreadTotal = 0;
  unreadByGroup: Record<NotificationGroup, number> = {
    [NotificationGroup.CHAT]: 0,
    [NotificationGroup.HEADQUARTERS]: 0,
    [NotificationGroup.SQUAD]: 0,
    [NotificationGroup.MISSIONS]: 0,
    [NotificationGroup.ANNOUNCEMENTS]: 0,
    [NotificationGroup.PUNISHMENTS]: 0,
  };
  preferences: NotificationPreferenceItem[] = [];
  listPreloader = new Preloader();
  unreadPreloader = new Preloader();
  preferencesPreloader = new Preloader();

  constructor() {
    makeAutoObservable(this);
  }

  openDrawer = () => {
    this.isDrawerOpen = true;
    void this.loadNotifications();
  };

  closeDrawer = () => {
    this.isDrawerOpen = false;
  };

  setDrawerOpen = (open: boolean) => {
    this.isDrawerOpen = open;
    if (open) {
      void this.loadNotifications();
    }
  };

  setFilter = (filter: NotificationFilter) => {
    this.filter = filter;
    void this.loadNotifications();
  };

  loadUnreadCount = async () => {
    this.unreadPreloader.start();
    try {
      const { data } = await notificationsApi.getUnreadCount();
      runInAction(() => {
        this.unreadTotal = data.total;
        this.unreadByGroup = {
          ...this.unreadByGroup,
          ...data.byGroup,
        };
      });
    } catch {
      // Keep previous badge state on transient failures.
    } finally {
      this.unreadPreloader.stop();
    }
  };

  loadNotifications = async () => {
    this.listPreloader.start();
    try {
      const group = this.filter === 'ALL' ? undefined : this.filter;
      const { data } = await notificationsApi.findNotifications({
        group,
        take: 100,
        skip: 0,
      });
      runInAction(() => {
        this.items = data.data;
        this.total = data.total;
      });
      await this.loadUnreadCount();
    } catch {
      toast.error('Не вдалося завантажити нотифікації');
    } finally {
      this.listPreloader.stop();
    }
  };

  markAsRead = async (id: string) => {
    try {
      const { data } = await notificationsApi.markAsRead(id);
      runInAction(() => {
        this.items = this.items.map(item => (item.id === id ? { ...item, ...data } : item));
      });
      await this.loadUnreadCount();
    } catch {
      toast.error('Не вдалося позначити нотифікацію');
    }
  };

  markAllAsRead = async () => {
    try {
      const group = this.filter === 'ALL' ? undefined : this.filter;
      await notificationsApi.markAllAsRead(group);
      runInAction(() => {
        const now = new Date().toISOString();
        this.items = this.items.map(item => ({
          ...item,
          readAt: item.readAt ?? now,
        }));
      });
      await this.loadUnreadCount();
    } catch {
      toast.error('Не вдалося позначити нотифікації');
    }
  };

  loadPreferences = async () => {
    this.preferencesPreloader.start();
    try {
      const { data } = await notificationsApi.getPreferences();
      runInAction(() => {
        this.preferences = data.preferences;
      });
    } catch {
      toast.error('Не вдалося завантажити налаштування нотифікацій');
    } finally {
      this.preferencesPreloader.stop();
    }
  };

  setPreferenceEnabled = async (group: NotificationGroup, enabled: boolean) => {
    const previous = this.preferences;
    runInAction(() => {
      this.preferences = this.preferences.map(pref =>
        pref.group === group ? { ...pref, enabled } : pref,
      );
    });

    try {
      const { data } = await notificationsApi.updatePreferences([{ group, enabled }]);
      runInAction(() => {
        this.preferences = data.preferences;
      });
    } catch {
      runInAction(() => {
        this.preferences = previous;
      });
      toast.error('Не вдалося оновити налаштування');
    }
  };

  applyIncoming = (payload: { group?: NotificationGroup }) => {
    const group = payload.group;
    if (!group || !(group in this.unreadByGroup)) {
      return;
    }

    if (this.isDrawerOpen) {
      void this.loadNotifications();
      return;
    }

    void this.loadUnreadCount();
  };

  connectRealtime = () => {
    if (notificationsSocket) {
      return;
    }

    const apiBaseUrl = env.apiUrl?.replace(/\/api\/?$/, '');
    if (!apiBaseUrl) {
      return;
    }

    notificationsSocket = io(`${apiBaseUrl}/notifications`, {
      withCredentials: true,
      transports: ['websocket'],
    });

    notificationsSocket.on('notification', (payload: unknown) => {
      const group =
        payload && typeof payload === 'object' && 'group' in payload
          ? (payload as { group?: NotificationGroup }).group
          : undefined;

      this.applyIncoming({ group });
    });
  };

  disconnectRealtime = () => {
    if (!notificationsSocket) {
      return;
    }

    notificationsSocket.removeAllListeners('notification');
    notificationsSocket.disconnect();
    notificationsSocket = null;
  };
}

export const notificationsState = new NotificationsState();
