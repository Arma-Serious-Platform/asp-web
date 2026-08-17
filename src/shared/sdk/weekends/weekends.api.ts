'use client';

import { ApiModel, type PaginatedResponse } from '../api-model';
import type {
  CreateGameDto,
  CreateWeekendDto,
  FindWeekendsDto,
  Game,
  UpdateGameDto,
  UpdateWeekendDto,
  Weekend,
} from './weekends.schemas';

export type * from './weekends.schemas';
export * from './weekends.schemas';

class WeekendsApi extends ApiModel {
  findWeekends = async (dto: FindWeekendsDto = {}) => {
    return await this.instance.get<PaginatedResponse<Weekend>>('/weekends', {
      params: dto,
    });
  };

  createWeekend = async (dto: CreateWeekendDto) => {
    return await this.instance.post<Weekend>('/weekends', dto);
  };

  updateWeekend = async (id: string, dto: UpdateWeekendDto) => {
    return await this.instance.patch<Weekend>(`/weekends/${id}`, dto);
  };

  deleteWeekend = async (weekendId: string) => {
    return await this.instance.delete<Weekend>(`/weekends/${weekendId}`);
  };

  findWeekendById = async (weekendId: string) => {
    return await this.instance.get<Weekend>(`/weekends/${weekendId}`);
  };

  createGame = async (weekendId: string, dto: CreateGameDto) => {
    return await this.instance.post<Game>(`/weekends/${weekendId}/games`, dto);
  };

  updateGame = async (weekendId: string, gameId: string, dto: UpdateGameDto) => {
    return await this.instance.patch<Game>(`/weekends/${weekendId}/games/${gameId}`, dto);
  };

  deleteGame = async (weekendId: string, gameId: string) => {
    return await this.instance.delete<Game>(`/weekends/${weekendId}/games/${gameId}`);
  };
}

export const weekendsApi = new WeekendsApi();
export { WeekendsApi };
