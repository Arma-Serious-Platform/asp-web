import { session } from '@/entities/session/model';
import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

class DisconnectSteamModel {
  constructor() {
    makeAutoObservable(this);
  }

  modal = new Visibility();
  loader = new Loader();

  disconnect = async (onSuccess?: () => void) => {
    try {
      this.loader.start();
      await api.disconnectSteam();
      await session.fetchMe();
      toast.success('Steam успішно відв\'язано');
      this.modal.close();
      onSuccess?.();
    } catch {
      toast.error('Не вдалося відв\'язати Steam');
    } finally {
      this.loader.stop();
    }
  };
}

export { DisconnectSteamModel };
