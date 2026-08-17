'use client';

import { ApiModel, type PaginatedResponse } from '../api-model';
import type { CreateIslandDto, FindIslandsDto, Island, UpdateIslandDto } from './islands.schemas';

export type * from './islands.schemas';
export * from './islands.schemas';

class IslandsApi extends ApiModel {
  findIslands = async () => {
    return await this.instance.get<Island[]>('/missions/islands');
  };

  findIslandsPaginated = async (dto: FindIslandsDto) => {
    return await this.instance.get<PaginatedResponse<Island>>('/islands', {
      params: dto,
    });
  };

  findIslandById = async (id: string) => {
    return await this.instance.get<Island>(`/islands/${id}`);
  };

  createIsland = async (dto: CreateIslandDto) => {
    return await this.instance.post<Island>('/islands', dto);
  };

  updateIsland = async (id: string, dto: UpdateIslandDto) => {
    return await this.instance.patch<Island>(`/islands/${id}`, dto);
  };

  deleteIsland = async (id: string) => {
    return await this.instance.delete<void>(`/islands/${id}`);
  };
}

export const islandsApi = new IslandsApi();
export { IslandsApi };
