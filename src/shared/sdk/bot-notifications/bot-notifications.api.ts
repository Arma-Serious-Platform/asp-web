'use client';

import { ApiModel } from '../api-model';
import type {
  BotNotification,
  CreateBotNotificationDto,
  SendBotNotificationDto,
  UpdateBotNotificationDto,
} from './bot-notifications.schemas';

export type * from './bot-notifications.schemas';
export * from './bot-notifications.schemas';

class BotNotificationsApi extends ApiModel {
  findAll = async () => {
    return await this.instance.get<BotNotification[]>('/bot-notifications');
  };

  findById = async (id: string) => {
    return await this.instance.get<BotNotification>(`/bot-notifications/${id}`);
  };

  create = async (dto: CreateBotNotificationDto) => {
    return await this.instance.post<BotNotification>('/bot-notifications', dto);
  };

  update = async ({ id, ...dto }: UpdateBotNotificationDto) => {
    return await this.instance.patch<BotNotification>(`/bot-notifications/${id}`, dto);
  };

  delete = async (id: string) => {
    return await this.instance.delete<{ message: string }>(`/bot-notifications/${id}`);
  };

  send = async ({ id, message }: SendBotNotificationDto) => {
    return await this.instance.post<{ message: string }>(`/bot-notifications/${id}/send`, {
      message,
    });
  };
}

export const botNotificationsApi = new BotNotificationsApi();
export { BotNotificationsApi };
