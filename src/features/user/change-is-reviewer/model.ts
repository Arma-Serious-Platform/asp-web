import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import { User } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class ChangeIsReviewerModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  visibility = new Visibility<{
    user: User;
    isMissionReviewer: boolean;
  }>();

  async changeIsReviewer(userId: string, isMissionReviewer: boolean, onSuccess?: (isMissionReviewer: boolean) => void) {
    try {
      this.loader.start();

      await api.changeIsMissionReviewer(userId, isMissionReviewer);

      if (onSuccess) {
        onSuccess(isMissionReviewer);
      }

      toast.success(
        `${this.visibility.payload?.user?.nickname} ${
          isMissionReviewer ? 'тепер перевіряючий місій' : 'більше не перевіряючий місій'
        }`,
      );
      this.visibility.close();
    } catch {
      toast.error('Не вдалося змінити статус перевіряючого місій');
    } finally {
      this.loader.stop();
    }
  }
}

export const changeIsReviewerModel = new ChangeIsReviewerModel();
