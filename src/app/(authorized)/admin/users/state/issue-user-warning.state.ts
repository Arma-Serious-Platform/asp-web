import { Loader } from '@/shared/state/loader';
import { Visibility } from '@/shared/state/visibility';
import { usersApi } from '@/shared/sdk';
import { User, UserWarning } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class IssueUserWarningState {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  visibility = new Visibility<{
    user: User;
  }>();

  async issueWarning(reason: string, onSuccess?: (warning: UserWarning) => void) {
    const userId = this.visibility.payload?.user.id;

    if (!userId) return;

    try {
      this.loader.start();
      const { data } = await usersApi.createUserWarning({ userId, reason });

      onSuccess?.(data);

      toast.success('Попередження видано');
      this.visibility.close();
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося видати попередження');
    } finally {
      this.loader.stop();
    }
  }
}

export const issueUserWarningState = new IssueUserWarningState();
