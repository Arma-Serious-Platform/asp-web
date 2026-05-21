import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import { User, UserPunishment, UserWarning } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class PunishmentHistoryModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  removeLoader = new Loader();

  visibility = new Visibility<{
    user: User;
  }>();

  warnings: UserWarning[] = [];

  history: UserPunishment[] = [];

  async load() {
    const userId = this.visibility.payload?.user.id;

    if (!userId) return;

    try {
      this.loader.start();
      const [warningsResponse, historyResponse] = await Promise.all([
        api.findUserWarnings(userId),
        api.findUserPunishmentHistory(userId),
      ]);

      this.warnings = warningsResponse.data;
      this.history = historyResponse.data;
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося завантажити історію покарань');
    } finally {
      this.loader.stop();
    }
  }

  async removeWarning(warningId: string, reason?: string, onSuccess?: (warning: UserWarning) => void) {
    try {
      this.removeLoader.start();
      const { data } = await api.removeUserWarning(warningId, reason);

      this.warnings = this.warnings.filter(warning => warning.id !== warningId);
      await this.load();

      onSuccess?.(data);
      toast.success('Попередження знято');
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося зняти попередження');
    } finally {
      this.removeLoader.stop();
    }
  }
}

export const punishmentHistoryModel = new PunishmentHistoryModel();
