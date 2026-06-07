import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import { Mission, State } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class ChangeMissionStateModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  visibility = new Visibility<{
    mission: Mission;
    state: State;
  }>();

  async changeState(onSuccess?: (state: State) => void | Promise<void>) {
    const payload = this.visibility.payload;
    if (!payload) return;

    try {
      this.loader.start();

      await api.changeMissionState(payload.mission.id, { state: payload.state });
      await onSuccess?.(payload.state);

      toast.success(payload.state === State.ARCHIVED ? 'Місію архівовано' : 'Місію повернено з архіву');
      this.visibility.close();
    } catch {
      toast.error('Не вдалося змінити стан місії');
    } finally {
      this.loader.stop();
    }
  }
}
