import { z } from 'zod';
import { StateSchema } from '../api-model';

export const BotNotificationTypeSchema = z.enum([
  'WEEKENDS',
  'NEWS',
  'NEWS_INFO',
  'NEWS_TECH_UPDATE',
  'NEWS_WEBSITE_UPDATE',
  'MANUAL',
]);
export const BotNotificationType = BotNotificationTypeSchema.enum;
export type BotNotificationType = z.infer<typeof BotNotificationTypeSchema>;

export const BotNotificationSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    type: BotNotificationTypeSchema,
    telegramToken: z.string().nullable().optional(),
    telegramChannelId: z.string().nullable().optional(),
    discordToken: z.string().nullable().optional(),
    discordChannelId: z.string().nullable().optional(),
    status: StateSchema,
    url: z.string().nullable().optional(),
    hasTelegram: z.boolean().optional(),
    hasDiscord: z.boolean().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough();
export type BotNotification = z.infer<typeof BotNotificationSchema>;

export type CreateBotNotificationDto = {
  name: string;
  type: BotNotificationType;
  telegramToken?: string | null;
  telegramChannelId?: string | null;
  discordToken?: string | null;
  discordChannelId?: string | null;
  status?: z.infer<typeof StateSchema>;
  url?: string | null;
};

export type UpdateBotNotificationDto = Partial<CreateBotNotificationDto> & { id: string };

export type SendBotNotificationDto = {
  id: string;
  message: string;
};
