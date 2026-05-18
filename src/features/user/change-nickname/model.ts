import { session } from '@/entities/session/model';
import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import { ChangeNicknameDto } from '@/shared/sdk/types';
import { isAxiosError } from 'axios';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

class ChangeNicknameModel {
  constructor() {
    makeAutoObservable(this);
  }

  modal = new Visibility();
  loader = new Loader();

  changeNickname = async (dto: ChangeNicknameDto) => {
    try {
      this.loader.start();
      await api.changeNickname(dto);
      await session.fetchMe();
      toast.success('Позивний успішно змінено');
      this.modal.close();
    } catch (error) {
      if (
        isAxiosError(error) &&
        (error.response?.data?.message === 'User already exists' ||
          error.response?.data?.message === 'Nickname is already taken')
      ) {
        throw error;
      }

      toast.error('Не вдалося змінити позивний');
      throw error;
    } finally {
      this.loader.stop();
    }
  };
}

export { ChangeNicknameModel };
