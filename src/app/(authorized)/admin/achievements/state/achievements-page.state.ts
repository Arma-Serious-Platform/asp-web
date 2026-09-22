import { achievementsApi } from '@/shared/sdk';
import { Achievement } from '@/shared/sdk/types';
import { Loader } from '@/shared/state/loader';
import { makeAutoObservable } from 'mobx';
import { ManageAchievementState } from './manage-achievements.state';

class AchievementsPageState {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  achievements: Achievement[] = [];

  manageAchievement = new ManageAchievementState();

  load = async () => {
    try {
      this.loader.start();
      const { data } = await achievementsApi.findAchievements();

      this.achievements = data;
    } catch (error) {
      console.error(error);
    } finally {
      this.loader.stop();
    }
  };
}

export const achievementsPageState = new AchievementsPageState();
