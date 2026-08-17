import { session } from '@/entities/session/session.state';
import { Loader } from '@/shared/state/loader';
import { Visibility } from '@/shared/state/visibility';
import { usersApi } from '@/shared/sdk';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

class DisconnectSteamState {
  constructor() {
    makeAutoObservable(this);
  }

  modal = new Visibility();
  loader = new Loader();

  disconnect = async (onSuccess?: () => void) => {
    try {
      this.loader.start();
      await usersApi.disconnectSteam();
      await session.fetchMe();
      toast.success("Steam успішно відв'язано");
      this.modal.close();
      onSuccess?.();
    } catch {
      toast.error("Не вдалося відв'язати Steam");
    } finally {
      this.loader.stop();
    }
  };
}

export { DisconnectSteamState };
