import { BotNotificationType } from '@/shared/sdk/bot-notifications/bot-notifications.schemas';

export const BOT_NOTIFICATION_TYPE_LABELS: Record<BotNotificationType, string> = {
  [BotNotificationType.WEEKENDS]: 'Анонси',
  [BotNotificationType.NEWS]: 'Новини',
  [BotNotificationType.MANUAL]: 'Ручні',
};
