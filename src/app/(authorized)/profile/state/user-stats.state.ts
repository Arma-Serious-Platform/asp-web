import { Loader } from '@/shared/state/loader';
import { usersApi } from '@/shared/sdk';
import type { PlayerStatsResponse } from '@/shared/sdk/stats/stats.schemas';
import { isAxiosError } from 'axios';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class UserStatsState {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  stats: PlayerStatsResponse | null = null;
  notFound = false;
  steamNotConnected = false;
  error = false;

  private userId?: string;

  async load(userId?: string) {
    // Covers Strict Mode's repeated effect and coming back to the tab.
    if (userId && this.userId === userId && (this.loader.isLoading || this.stats)) return;

    this.userId = userId;
    this.stats = null;
    this.notFound = false;
    this.steamNotConnected = false;
    this.error = false;

    if (!userId) return;

    try {
      this.loader.start();
      const stats = await usersApi.findUserStats(userId);

      if (this.userId === userId) this.stats = stats;
    } catch (error) {
      if (this.userId !== userId) return;

      // Players who have never played have no stats, which is not a failure.
      if (isAxiosError(error) && error.response?.status === 404) {
        this.notFound = true;
        return;
      }

      if (isAxiosError(error) && error.response?.data?.message === 'Steam is not connected') {
        this.steamNotConnected = true;
        return;
      }

      console.error(error);
      toast.error('Не вдалося завантажити статистику гравця');
      this.error = true;
    } finally {
      this.loader.stop();
    }
  }
}
