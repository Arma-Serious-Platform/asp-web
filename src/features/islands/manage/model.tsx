import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import { CreateIslandDto, Island, UpdateIslandDto } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class ManageIslandModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  modal = new Visibility<{
    island?: Island;
    mode: 'manage' | 'delete';
  }>();

  createIsland = async (dto: CreateIslandDto, onSuccess?: (island: Island) => void) => {
    try {
      this.loader.start();
      const { data } = await api.createIsland(dto);
      toast.success('Острів створено');
      this.modal.close();
      onSuccess?.(data);
    } catch {
      toast.error('Не вдалося створити острів');
    } finally {
      this.loader.stop();
    }
  };

  updateIsland = async (id: string, dto: UpdateIslandDto, onSuccess?: (island: Island) => void) => {
    try {
      this.loader.start();
      const { data } = await api.updateIsland(id, dto);
      toast.success('Острів оновлено');
      this.modal.close();
      onSuccess?.(data);
    } catch {
      toast.error('Не вдалося оновити острів');
    } finally {
      this.loader.stop();
    }
  };

  deleteIsland = async (id: string, onSuccess?: () => void) => {
    try {
      this.loader.start();
      await api.deleteIsland(id);
      toast.success('Острів видалено');
      this.modal.close();
      onSuccess?.();
    } catch {
      toast.error('Не вдалося видалити острів');
    } finally {
      this.loader.stop();
    }
  };
}
