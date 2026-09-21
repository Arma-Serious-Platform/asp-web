import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';
import { botNotificationsApi } from '@/shared/sdk';
import {
  BotNotification,
  CreateBotNotificationDto,
  UpdateBotNotificationDto,
} from '@/shared/sdk/bot-notifications/bot-notifications.schemas';
import { Loader } from '@/shared/state/loader';
import { Visibility } from '@/shared/state/visibility';

export class ManageBotNotificationState {
  loader = new Loader();
  sendLoader = new Loader();

  modal = new Visibility<{
    bot?: BotNotification;
    mode: 'manage' | 'delete' | 'send';
  }>();

  constructor() {
    makeAutoObservable(this);
  }

  create = async (dto: CreateBotNotificationDto, onSuccess?: (bot: BotNotification) => void) => {
    try {
      this.loader.start();
      const { data } = await botNotificationsApi.create(dto);
      toast.success('Бота створено');
      this.modal.close();
      onSuccess?.(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Не вдалося створити бота');
    } finally {
      this.loader.stop();
    }
  };

  update = async (dto: UpdateBotNotificationDto, onSuccess?: (bot: BotNotification) => void) => {
    try {
      this.loader.start();
      const { data } = await botNotificationsApi.update(dto);
      toast.success('Бота оновлено');
      this.modal.close();
      onSuccess?.(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Не вдалося оновити бота');
    } finally {
      this.loader.stop();
    }
  };

  delete = async (id: string, onSuccess?: () => void) => {
    try {
      this.loader.start();
      await botNotificationsApi.delete(id);
      toast.success('Бота видалено');
      this.modal.close();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Не вдалося видалити бота');
    } finally {
      this.loader.stop();
    }
  };

  send = async (id: string, message: string, onSuccess?: () => void) => {
    try {
      this.sendLoader.start();
      await botNotificationsApi.send({ id, message });
      toast.success('Повідомлення надіслано');
      this.modal.close();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Не вдалося надіслати повідомлення');
    } finally {
      this.sendLoader.stop();
    }
  };
}
