'use client';

import { makeAutoObservable } from 'mobx';
import { api } from '@/shared/sdk';
import type { GameAnnouncement } from '@/features/weekend/model';
import { mapWeekendToGameAnnouncement } from './map-weekend-to-announcement';

class WeekendsPageModel {
  announcements: GameAnnouncement[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  init = async () => {
    this.isLoading = true;
    this.error = null;
    try {
      const { data } = await api.findWeekends({
        published: true,
        take: 50,
      });
      const list = data?.data ?? [];
      this.announcements = list.map(mapWeekendToGameAnnouncement);
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Не вдалося завантажити анонси';
      this.announcements = [];
    } finally {
      this.isLoading = false;
    }
  };
}

export const weekendsPageModel = new WeekendsPageModel();
