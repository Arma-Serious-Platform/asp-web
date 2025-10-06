import { SideModel } from '@/entities/side/model';
import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import { CreateSquadDto, Squad, UpdateSquadDto } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

class ManageSquadModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  sides = new SideModel();

  modal = new Visibility<{
    squad?: Squad;
    mode: 'manage' | 'delete';
  }>();

  init = async () => {
    await this.sides.pagination.loadAll();
  };

  createSquad = async (
    squad: CreateSquadDto,
    onSuccess?: (squad: Squad) => void
  ) => {
    try {
      this.loader.start();
      const { data: createdSquad } = await api.createSquad(squad);

      toast.success('Загін успішно створений');

      this.modal.close();

      onSuccess?.(createdSquad);
    } catch {
      toast.error('Не вдалося створити загін');
    } finally {
      this.loader.stop();
    }
  };

  updateSquad = async (
    squad: UpdateSquadDto,
    onSuccess?: (squad: Squad) => void
  ) => {
    try {
      this.loader.start();
      const { data: updatedSquad } = await api.updateSquad(squad);

      toast.success('Загін успішно оновлений');

      this.modal.close();

      onSuccess?.(updatedSquad);
    } catch {
      toast.error('Не вдалося оновити загін');
    } finally {
      this.loader.stop();
    }
  };

  deleteSquad = async (squadId: string, onSuccess?: (squad: Squad) => void) => {
    try {
      this.loader.start();
      const { data: deletedSquad } = await api.deleteSquad(squadId);

      toast.success('Загін успішно видалений');

      this.modal.close();

      onSuccess?.(deletedSquad);
    } catch {
      toast.error('Не вдалося видалити загін');
    } finally {
      this.loader.stop();
    }
  };

  reset = () => {
    this.sides.reset();
  };
}

export { ManageSquadModel };
