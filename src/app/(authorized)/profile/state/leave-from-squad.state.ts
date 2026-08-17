import { Loader } from '@/shared/state/loader';
import { Visibility } from '@/shared/state/visibility';
import { squadsApi } from '@/shared/sdk';
import { Squad } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class LeaveFromSquadState {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  visibility = new Visibility<{
    squad: Squad;
    isLeader: boolean;
  }>();

  async leaveSquad(newLeaderId?: string, onSuccess?: () => void) {
    try {
      this.loader.start();
      await squadsApi.leaveFromSquad(newLeaderId);

      toast.success('Ви успішно покинули загін');

      this.visibility.close();
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Не вдалося покинути загін';
      toast.error(errorMessage);
    } finally {
      this.loader.stop();
    }
  }
}

export const leaveFromSquadState = new LeaveFromSquadState();
