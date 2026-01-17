import { Loader } from '@/shared/model/loader';
import { api } from '@/shared/sdk';
import { SquadInvitation } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class AcceptOrRejectInviteModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  acceptInvitation = async (invitationId: string, onSuccess?: (invitation: SquadInvitation) => void) => {
    try {
      this.loader.start();
      const { data: invitation } = await api.acceptSquadInvitation(invitationId);

      toast.success('Запрошення прийнято');

      onSuccess?.(invitation);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Не вдалося прийняти запрошення';
      toast.error(errorMessage);
    } finally {
      this.loader.stop();
    }
  };

  rejectInvitation = async (invitationId: string, onSuccess?: (invitation: SquadInvitation) => void) => {
    try {
      this.loader.start();
      const { data: invitation } = await api.rejectSquadInvitation(invitationId);

      toast.success('Запрошення відхилено');

      onSuccess?.(invitation);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Не вдалося відхилити запрошення';
      toast.error(errorMessage);
    } finally {
      this.loader.stop();
    }
  };
}

export const acceptOrRejectInviteModel = new AcceptOrRejectInviteModel();
