import { UserModel } from '@/entities/user/model';
import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import { InviteToSquadDto, Squad, SquadInvitation } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class InviteToSquadModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  users = new UserModel();

  visibility = new Visibility<{
    squad: Squad;
  }>();

  init = async () => {
    await this.users.pagination.init({
      take: 50,
      skip: 0,
    });
  };

  inviteToSquad = async (dto: InviteToSquadDto, onSuccess?: (invitation: SquadInvitation) => void) => {
    try {
      this.loader.start();
      const { data: invitation } = await api.inviteToSquad(dto);

      toast.success('Запрошення успішно надіслано');

      this.visibility.close();
      this.users.reset();

      onSuccess?.(invitation);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Не вдалося надіслати запрошення';
      toast.error(errorMessage);
    } finally {
      this.loader.stop();
    }
  };

  reset = () => {
    this.users.reset();
  };
}

export const inviteToSquadModel = new InviteToSquadModel();
