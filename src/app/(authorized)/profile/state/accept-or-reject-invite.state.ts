import { Loader } from '@/shared/state/loader';
import { Visibility } from '@/shared/state/visibility';
import { squadsApi } from '@/shared/sdk';
import { SquadInvitation } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export type SquadInviteConfirmAction = 'accept' | 'reject';

export class AcceptOrRejectInviteState {
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
      const { data: invitation } = await squadsApi.acceptSquadInvitation(invitationId);

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
      const { data: invitation } = await squadsApi.rejectSquadInvitation(invitationId);

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

export const acceptOrRejectInviteState = new AcceptOrRejectInviteState();
