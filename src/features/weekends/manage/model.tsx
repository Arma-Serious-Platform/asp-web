import { MissionModel } from '@/entities/mission/model';
import { SideModel } from '@/entities/side/model';
import { UserModel } from '@/entities/user/model';
import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import { CreateWeekendDto, UpdateWeekendDto, UserRole, Weekend } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class ManageWeekendModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  modal = new Visibility<{
    weekend?: Weekend;
    mode: 'manage' | 'delete';
  }>();

  sides = new SideModel();
  users = new UserModel();
  missions = new MissionModel();

  init = async () => {
    await Promise.all([
      this.sides.pagination.loadAll(),
      this.users.pagination.loadAll({
        role: UserRole.GAME_ADMIN,
      }),
      this.missions.pagination.loadAll(),
    ]);
  };

  createWeekend = async (dto: CreateWeekendDto, onSuccess?: (weekend: Weekend) => void) => {
    try {
      this.loader.start();
      const { data: createdWeekend } = await api.createWeekend(dto);

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
      const { data: updatedWeekend } = await api.updateWeekend(weekendId, dto);

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
      const { data: deletedWeekend } = await api.deleteWeekend(weekendId);

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

export const manageWeekendModel = new ManageWeekendModel();
