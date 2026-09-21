import { BotNotificationType } from '@/shared/sdk/bot-notifications/bot-notifications.schemas';

export const BOT_NOTIFICATION_TYPE_LABELS: Record<BotNotificationType, string> = {
  [BotNotificationType.WEEKENDS]: 'Анонси',
  [BotNotificationType.NEWS]: 'Новини (всі)',
  [BotNotificationType.NEWS_INFO]: 'Новини · Інфо',
  [BotNotificationType.NEWS_TECH_UPDATE]: 'Новини · Тех. оновлення',
  [BotNotificationType.NEWS_WEBSITE_UPDATE]: 'Новини · Оновлення сайту',
  [BotNotificationType.MANUAL]: 'Ручні',
};
