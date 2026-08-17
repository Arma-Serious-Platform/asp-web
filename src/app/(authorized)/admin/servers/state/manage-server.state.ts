import { serversApi } from '@/shared/sdk';
import { CreateServerDto, Server, UpdateServerDto } from '@/shared/sdk/types';
import { Loader } from '@/shared/state/loader';
import { Visibility } from '@/shared/state/visibility';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

class ManageServerState {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  modal = new Visibility<{
    server?: Server;
    mode: 'manage' | 'delete';
  }>();

  createServer = async (server: CreateServerDto, onSuccess?: (server: Server) => void) => {
    try {
      this.loader.start();
      const { data: createdServer } = await serversApi.createServer(server);

      toast.success('Сервер успішно створений');

      this.modal.close();

      onSuccess?.(createdServer);
    } catch {
      toast.error('Не вдалося створити сервер');
    } finally {
      this.loader.stop();
    }
  };

  updateServer = async (server: UpdateServerDto, onSuccess?: (server: Server) => void) => {
    try {
      this.loader.start();
      const { data: updatedServer } = await serversApi.updateServer(server);

      toast.success('Сервер успішно оновлений');

      this.modal.close();

      onSuccess?.(updatedServer);
    } catch {
      toast.error('Не вдалося оновити сервер');
    } finally {
      this.loader.stop();
    }
  };

  deleteServer = async (serverId: string, onSuccess?: (server: Server) => void) => {
    try {
      this.loader.start();
      const { data: deletedServer } = await serversApi.deleteServer(serverId);

      toast.success('Сервер успішно видалений');

      this.modal.close();

      onSuccess?.(deletedServer);
    } catch {
      toast.error('Не вдалося видалити сервер');
    } finally {
      this.loader.stop();
    }
  };
}

export { ManageServerState };

export const manageServerState = new ManageServerState();
