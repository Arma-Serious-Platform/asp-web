import { SidesState } from '@/entities/side/side-list.state';
import { UsersState } from '@/entities/user/user-list.state';
import { Loader } from '@/shared/state/loader';
import { Visibility } from '@/shared/state/visibility';
import { squadsApi } from '@/shared/sdk';
import { CreateSquadDto, FindUsersDto, Squad, UpdateSquadDto } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

const findUsersWithoutSquadParams = (params: Partial<FindUsersDto> = {}): FindUsersDto => ({
  hasSquad: false,
  take: 50,
  skip: 0,
  ...params,
});

class ManageSquadState {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  sides = new SidesState();

  users = new UsersState();

  modal = new Visibility<{
    squad?: Squad;
    mode: 'manage' | 'delete';
  }>();

  init = async () => {
    await this.sides.pagination.loadAll();
    await this.users.pagination.loadAll(findUsersWithoutSquadParams());
  };

  createSquad = async (squad: CreateSquadDto, onSuccess?: (squad: Squad) => void) => {
    try {
      this.loader.start();
      const { data: createdSquad } = await squadsApi.createSquad(squad);

      toast.success('Загін успішно створений');

      this.modal.close();

      onSuccess?.(createdSquad);
    } catch {
      toast.error('Не вдалося створити загін');
    } finally {
      this.loader.stop();
    }
  };

  updateSquad = async (squad: UpdateSquadDto, onSuccess?: (squad: Squad) => void) => {
    try {
      this.loader.start();
      const { data: updatedSquad } = await squadsApi.updateSquad(squad);

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
      const { data: deletedSquad } = await squadsApi.deleteSquad(squadId);

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
    this.users.reset();
  };
}

export { ManageSquadState };
