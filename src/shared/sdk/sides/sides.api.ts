'use client';

import { ApiModel, type PaginatedResponse } from '../api-model';
import type { CreateSideDto, FindSidesDto, Side, UpdateSideDto } from './sides.schemas';

export type * from './sides.schemas';
export * from './sides.schemas';

class SidesApi extends ApiModel {
  findSides = async (dto: FindSidesDto) => {
    return await this.instance.get<PaginatedResponse<Side>>('/sides', {
      params: dto,
    });
  };

  findSideById = async (id: string) => {
    return await this.instance.get<Side>(`/sides/${id}`);
  };

  createSide = async (dto: CreateSideDto) => {
    return await this.instance.post<Side>('/sides', dto);
  };

  updateSide = async (id: string, dto: UpdateSideDto) => {
    return await this.instance.patch<Side>(`/sides/${id}`, dto);
  };

  deleteSide = async (id: string) => {
    return await this.instance.delete<Side>(`/sides/${id}`);
  };

  assignSquadToSide = async (sideId: string, squadId: string) => {
    return await this.instance.post<Side>(`/sides/${sideId}/assign-squad/${squadId}`);
  };

  assignLeaderToSide = async (sideId: string, leaderId: string) => {
    return await this.instance.post<Side>(`/sides/${sideId}/assign-leader/${leaderId}`);
  };

  unassignSquadFromSide = async (sideId: string, squadId: string) => {
    return await this.instance.post<Side>(`/sides/${sideId}/unassign-squad/${squadId}`);
  };
}

export const sidesApi = new SidesApi();
export { SidesApi };
