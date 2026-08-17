import { session } from '@/entities/session/session.state';
import { Loader } from '@/shared/state/loader';
import { Visibility } from '@/shared/state/visibility';
import { usersApi } from '@/shared/sdk';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

class ChangeAvatarState {
  constructor() {
    makeAutoObservable(this);
  }

  modal = new Visibility();

  loader = new Loader();

  changeAvatar = async (avatar: File) => {
    try {
      this.loader.start();
      await usersApi.changeAvatar(avatar);
      await session.fetchMe();
      toast.success('Аватар успішно змінено');
      this.modal.close();
    } catch {
      toast.error('Не вдалося змінити аватар');
    } finally {
      this.loader.stop();
    }
  };
}

export { ChangeAvatarState };
