import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import { SquadJoinRequest } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export type SquadJoinRequestConfirmAction = 'accept' | 'reject';

export class SquadJoinRequestsModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();
  actionLoader = new Loader();
  confirmVisibility = new Visibility<{
    request: SquadJoinRequest;
    action: SquadJoinRequestConfirmAction;
  }>();

  requests: SquadJoinRequest[] = [];

  load = async () => {
    try {
      this.loader.start();
      const { data } = await api.squadJoinRequests();
      this.requests = data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Не вдалося завантажити заявки';
      toast.error(errorMessage);
    } finally {
      this.loader.stop();
    }
  };

  acceptRequest = async (requestId: string, onSuccess?: (request: SquadJoinRequest) => void | Promise<void>) => {
    try {
      this.actionLoader.start();
      const { data } = await api.acceptSquadJoinRequest(requestId);

      this.requests = this.requests.filter(request => request.id !== requestId);
      toast.success('Заявку прийнято');
      await onSuccess?.(data);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Не вдалося прийняти заявку';
      toast.error(errorMessage);
    } finally {
      this.actionLoader.stop();
    }
  };

  rejectRequest = async (requestId: string, onSuccess?: (request: SquadJoinRequest) => void | Promise<void>) => {
    try {
      this.actionLoader.start();
      const { data } = await api.rejectSquadJoinRequest(requestId);

      this.requests = this.requests.filter(request => request.id !== requestId);
      toast.success('Заявку відхилено');
      await onSuccess?.(data);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Не вдалося відхилити заявку';
      toast.error(errorMessage);
    } finally {
      this.actionLoader.stop();
    }
  };
}
