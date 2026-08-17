import { MissionsState } from '@/entities/mission/mission-list.state';
import { SidesState } from '@/entities/side/side-list.state';
import { SquadsState } from '@/entities/squad/squad-list.state';
import { UsersState } from '@/entities/user/user-list.state';
import { Loader } from '@/shared/state/loader';
import { Visibility } from '@/shared/state/visibility';
import { weekendsApi } from '@/shared/sdk';
import { CreateWeekendDto, UpdateWeekendDto, Weekend } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class ManageWeekendState {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  modal = new Visibility<{
    weekend?: Weekend;
    mode: 'manage' | 'delete';
  }>();

  sides = new SidesState();
  squads = new SquadsState();
  users = new UsersState();
  missions = new MissionsState();

  init = async () => {
    await Promise.all([
      this.sides.pagination.loadAll(),
      this.squads.pagination.loadAll(),
      this.users.pagination.loadAll(),
      this.missions.pagination.loadAll(),
    ]);
  };

  createWeekend = async (dto: CreateWeekendDto, onSuccess?: (weekend: Weekend) => void) => {
    try {
      this.loader.start();
      const { data: createdWeekend } = await weekendsApi.createWeekend(dto);

      toast.success('Анонс успішно створений');

      this.modal.close();

      onSuccess?.(createdWeekend);
    } catch {
      toast.error('Не вдалося створити анонс');
    } finally {
      this.loader.stop();
    }
  };

  updateWeekend = async (weekendId: string, dto: UpdateWeekendDto, onSuccess?: (weekend: Weekend) => void) => {
    try {
      this.loader.start();
      const { data: updatedWeekend } = await weekendsApi.updateWeekend(weekendId, dto);

      toast.success('Анонс успішно оновлений');

      this.modal.close();

      onSuccess?.(updatedWeekend);
    } catch {
      toast.error('Не вдалося оновити анонс');
    } finally {
      this.loader.stop();
    }
  };

  deleteWeekend = async (weekendId: string, onSuccess?: (weekend: Weekend) => void) => {
    try {
      this.loader.start();
      const { data: deletedWeekend } = await weekendsApi.deleteWeekend(weekendId);

      toast.success('Анонс успішно видалений');

      this.modal.close();

      onSuccess?.(deletedWeekend);
    } catch {
      toast.error('Не вдалося видалити анонс');
    } finally {
      this.loader.stop();
    }
  };
}

export const manageWeekendState = new ManageWeekendState();
