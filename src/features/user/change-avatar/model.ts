import { session } from '@/entities/session/model';
import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

class ChangeAvatarModel {
  constructor() {
    makeAutoObservable(this);
  }

  modal = new Visibility();

  loader = new Loader();

  changeAvatar = async (avatar: File) => {
    try {
      this.loader.start();
      await api.changeAvatar(avatar);
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

export { ChangeAvatarModel };
