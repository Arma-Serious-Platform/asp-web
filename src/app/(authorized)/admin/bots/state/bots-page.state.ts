import { makeAutoObservable } from 'mobx';
import { botNotificationsApi } from '@/shared/sdk';
import { BotNotification } from '@/shared/sdk/bot-notifications/bot-notifications.schemas';
import { Loader } from '@/shared/state/loader';
import { ManageBotNotificationState } from './manage-bots.state';

class BotsPageState {
  loader = new Loader();
  bots: BotNotification[] = [];
  manage = new ManageBotNotificationState();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  load = async () => {
    try {
      this.loader.start();
      const { data } = await botNotificationsApi.findAll();
      this.bots = data;
    } catch (error) {
      console.error(error);
    } finally {
      this.loader.stop();
    }
  };
}

export const botsPageState = new BotsPageState();
