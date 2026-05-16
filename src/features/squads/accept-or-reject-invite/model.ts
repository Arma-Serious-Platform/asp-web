import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import { SquadInvitation } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export type SquadInviteConfirmAction = 'accept' | 'reject';

export class AcceptOrRejectInviteModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  confirmVisibility = new Visibility<{
    invitation: SquadInvitation;
    action: SquadInviteConfirmAction;
  }>();

  acceptInvitation = async (
    invitationId: string,
    onSuccess?: (invitation: SquadInvitation) => void | Promise<void>,
  ) => {
    try {
      this.loader.start();
      const { data: invitation } = await api.acceptSquadInvitation(invitationId);

      toast.success('Запрошення прийнято');

      await onSuccess?.(invitation);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Не вдалося прийняти запрошення';
      toast.error(errorMessage);
    } finally {
      this.loader.stop();
    }
  };

  rejectInvitation = async (
    invitationId: string,
    onSuccess?: (invitation: SquadInvitation) => void | Promise<void>,
  ) => {
    try {
      this.loader.start();
      const { data: invitation } = await api.rejectSquadInvitation(invitationId);

      toast.success('Запрошення відхилено');

      await onSuccess?.(invitation);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Не вдалося відхилити запрошення';
      toast.error(errorMessage);
    } finally {
      this.loader.stop();
    }
  };
}

export const acceptOrRejectInviteModel = new AcceptOrRejectInviteModel();
