import { Loader } from '@/shared/state/loader';
import { Visibility } from '@/shared/state/visibility';
import { achievementsApi, usersApi } from '@/shared/sdk';
import { Achievement, User } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class ManageUserAchievementsState {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();
  catalogLoader = new Loader();
  visibility = new Visibility<{ user: User }>();
  catalog: Achievement[] = [];
  assignedIds: string[] = [];

  get user() {
    return this.visibility.payload?.user ?? null;
  }

  loadCatalog = async () => {
    if (this.catalog.length) return;

    try {
      this.catalogLoader.start();
      const { data } = await achievementsApi.findAchievements();
      this.catalog = data;
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося завантажити досягнення');
    } finally {
      this.catalogLoader.stop();
    }
  };

  loadAssigned = async () => {
    const user = this.user;
    if (!user?.id) {
      this.assignedIds = [];
      return;
    }

    try {
      this.catalogLoader.start();
      const { data } = await usersApi.getUserByIdOrNickname(user.id);
      this.assignedIds = (data.achievements as Achievement[] | undefined)?.map(item => item.id) ?? [];
    } catch (error) {
      console.error(error);
      this.assignedIds = (user.achievements as Achievement[] | undefined)?.map(item => item.id) ?? [];
      if (!user.achievements) {
        toast.error('Не вдалося завантажити досягнення гравця');
      }
    } finally {
      this.catalogLoader.stop();
    }
  };

  async save(achievementIds: string[], onSuccess?: (userId: string, achievements: Achievement[]) => void) {
    const user = this.user;
    if (!user?.id) return;

    try {
      this.loader.start();
      const { data } = await achievementsApi.setUserAchievements({
        userId: user.id,
        achievementIds,
      });

      onSuccess?.(user.id, data.achievements ?? []);
      toast.success('Досягнення оновлено');
      this.visibility.close();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Не вдалося оновити досягнення');
    } finally {
      this.loader.stop();
    }
  }
}
