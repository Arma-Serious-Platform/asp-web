'use client';

import { ApiModel } from '../api-model';
import type {
  Achievement,
  CreateAchievementDto,
  SetUserAchievementsDto,
  UpdateAchievementDto,
} from './achievements.schemas';

export type * from './achievements.schemas';
export * from './achievements.schemas';

class AchievementsApi extends ApiModel {
  findAchievements = async () => {
    return await this.instance.get<Achievement[]>('/achievements');
  };

  findAchievementById = async (id: string) => {
    return await this.instance.get<Achievement>(`/achievements/${id}`);
  };

  createAchievement = async (dto: CreateAchievementDto) => {
    const formData = new FormData();
    formData.append('title', dto.title);
    formData.append('description', dto.description);
    formData.append('icon', dto.icon);

    return await this.instance.post<Achievement>('/achievements', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  updateAchievement = async ({ id, ...dto }: UpdateAchievementDto) => {
    const formData = new FormData();

    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value instanceof File ? value : value.toString());
      }
    });

    return await this.instance.patch<Achievement>(`/achievements/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  deleteAchievement = async (id: string) => {
    return await this.instance.delete<{ id: string }>(`/achievements/${id}`);
  };

  setUserAchievements = async ({ userId, achievementIds }: SetUserAchievementsDto) => {
    return await this.instance.put<{ id: string; nickname: string; achievements: Achievement[] }>(
      `/achievements/users/${userId}`,
      { achievementIds },
    );
  };
}

export const achievementsApi = new AchievementsApi();
export { AchievementsApi };
