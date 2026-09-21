import {
  NotificationGroup,
  NotificationType,
  type Notification,
  type NotificationPayload,
} from '@/shared/sdk/notifications/notifications.schemas';
import { ROUTES } from '@/shared/config/routes';

export const NOTIFICATION_GROUP_LABELS: Record<NotificationGroup, string> = {
  [NotificationGroup.CHAT]: 'Чат',
  [NotificationGroup.HEADQUARTERS]: 'Штаб',
  [NotificationGroup.SQUAD]: 'Загін',
  [NotificationGroup.MISSIONS]: 'Місії',
  [NotificationGroup.ANNOUNCEMENTS]: 'Анонси',
  [NotificationGroup.NEWS]: 'Новини',
  [NotificationGroup.PUNISHMENTS]: 'Покарання',
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.NEW_CHAT_MESSAGE]: 'Нове повідомлення',
  [NotificationType.NEW_MISSION_COMMENT]: 'Новий коментар до місії',
  [NotificationType.NEW_PLAN_COMMENT]: 'Новий коментар у плані',
  [NotificationType.SQUAD_INVITE]: 'Запрошення до загону',
  [NotificationType.SQUAD_JOIN_REQUEST]: 'Запит на вступ',
  [NotificationType.WARNING]: 'Попередження',
  [NotificationType.WARNING_REMOVED]: 'Попередження знято',
  [NotificationType.TEMP_BAN]: 'Тимчасовий бан',
  [NotificationType.PERMANENT_BAN]: 'Перманентний бан',
  [NotificationType.UNBAN]: 'Розбан',
  [NotificationType.WEEKEND_PUBLISHED]: 'Опубліковано анонс',
  [NotificationType.NEWS_PUBLISHED]: 'Опубліковано новину',
};

export const ALL_NOTIFICATION_GROUPS = Object.values(NotificationGroup);

export const getNotificationHref = (notification: Notification): string | null => {
  const payload = (notification.payload ?? {}) as NotificationPayload;
  const targetId = notification.targetId ?? undefined;

  switch (notification.type) {
    case NotificationType.NEW_CHAT_MESSAGE: {
      const peerUserId = payload.peerUserId;
      if (!peerUserId) return `${ROUTES.user.profile}?tab=chat`;
      return `${ROUTES.user.profile}?tab=chat&userId=${peerUserId}`;
    }
    case NotificationType.NEW_MISSION_COMMENT:
      return targetId ? ROUTES.missions.id(targetId) : ROUTES.missions.root;
    case NotificationType.NEW_PLAN_COMMENT:
      return targetId ? ROUTES.hq.planById(targetId) : ROUTES.hq.plans;
    case NotificationType.SQUAD_INVITE:
    case NotificationType.SQUAD_JOIN_REQUEST:
      return `${ROUTES.user.profile}?tab=squad`;
    case NotificationType.WEEKEND_PUBLISHED:
      return targetId ? ROUTES.weekendByAnchor(targetId) : ROUTES.weekends;
    case NotificationType.NEWS_PUBLISHED:
      return targetId ? ROUTES.newsById(targetId) : ROUTES.news;
    case NotificationType.WARNING:
    case NotificationType.WARNING_REMOVED:
    case NotificationType.TEMP_BAN:
    case NotificationType.PERMANENT_BAN:
    case NotificationType.UNBAN:
      return `${ROUTES.user.profile}?tab=profile`;
    default:
      return null;
  }
};

export const getNotificationDescription = (notification: Notification): string | null => {
  const payload = (notification.payload ?? {}) as NotificationPayload;

  if (notification.type === NotificationType.NEW_CHAT_MESSAGE && payload.preview) {
    return payload.preview;
  }

  if (payload.reason) {
    return payload.reason;
  }

  if (notification.type === NotificationType.WEEKEND_PUBLISHED && payload.name) {
    return payload.name;
  }

  if (notification.type === NotificationType.NEWS_PUBLISHED && payload.title) {
    return payload.title;
  }

  return null;
};
