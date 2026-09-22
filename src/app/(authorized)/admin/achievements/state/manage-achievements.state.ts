import { Loader } from '@/shared/state/loader';
import { Visibility } from '@/shared/state/visibility';
import { achievementsApi } from '@/shared/sdk';
import {
  Achievement,
  CreateAchievementDto,
  UpdateAchievementDto,
} from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class ManageAchievementState {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  modal = new Visibility<{
    achievement?: Achievement;
    mode: 'manage' | 'delete';
  }>();

  createAchievement = async (dto: CreateAchievementDto, onSuccess?: (achievement: Achievement) => void) => {
    try {
      this.loader.start();
      const { data } = await achievementsApi.createAchievement(dto);

      toast.success('Досягнення створено');
      this.modal.close();
      onSuccess?.(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Не вдалося створити досягнення');
    } finally {
      this.loader.stop();
    }
  };

  updateAchievement = async (dto: UpdateAchievementDto, onSuccess?: (achievement: Achievement) => void) => {
    try {
      this.loader.start();
      const { data } = await achievementsApi.updateAchievement(dto);

      toast.success('Досягнення оновлено');
      this.modal.close();
      onSuccess?.(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Не вдалося оновити досягнення');
    } finally {
      this.loader.stop();
    }
  };

  deleteAchievement = async (id: string, onSuccess?: () => void) => {
    try {
      this.loader.start();
      await achievementsApi.deleteAchievement(id);

      toast.success('Досягнення видалено');
      this.modal.close();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Не вдалося видалити досягнення');
    } finally {
      this.loader.stop();
    }
  };
}
