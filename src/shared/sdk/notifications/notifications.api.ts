'use client';

import { ApiModel, type PaginatedResponse } from '../api-model';
import type {
  Notification,
  NotificationGroup,
  NotificationPreferences,
  NotificationUnreadCount,
} from './notifications.schemas';

export type * from './notifications.schemas';
export * from './notifications.schemas';

class NotificationsApi extends ApiModel {
  findNotifications = async (dto: { group?: NotificationGroup; take?: number; skip?: number } = {}) => {
    return await this.instance.get<PaginatedResponse<Notification>>('/notifications', {
      params: dto,
    });
  };

  getUnreadCount = async () => {
    return await this.instance.get<NotificationUnreadCount>('/notifications/unread-count');
  };

  markAsRead = async (id: string) => {
    return await this.instance.patch<Notification>(`/notifications/${id}/read`);
  };

  markAllAsRead = async (group?: NotificationGroup) => {
    return await this.instance.post<{ count: number }>('/notifications/read-all', {
      ...(group ? { group } : {}),
    });
  };

  getPreferences = async () => {
    return await this.instance.get<NotificationPreferences>('/notifications/preferences');
  };

  updatePreferences = async (preferences: { group: NotificationGroup; enabled: boolean }[]) => {
    return await this.instance.put<NotificationPreferences>('/notifications/preferences', {
      preferences,
    });
  };
}

export const notificationsApi = new NotificationsApi();
export { NotificationsApi };
