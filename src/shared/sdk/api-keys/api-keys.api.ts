'use client';

import { ApiModel } from '../api-model';
import type { ApiKey, CreateApiKeyDto, CreateApiKeyResponse, UpdateApiKeyDto } from './api-keys.schemas';

export type * from './api-keys.schemas';
export * from './api-keys.schemas';

class ApiKeysApi extends ApiModel {
  findAll = async () => {
    return await this.instance.get<ApiKey[]>('/api-keys');
  };

  create = async (dto: CreateApiKeyDto) => {
    return await this.instance.post<CreateApiKeyResponse>('/api-keys', dto);
  };

  update = async (id: string, dto: UpdateApiKeyDto) => {
    return await this.instance.patch<ApiKey>(`/api-keys/${id}`, dto);
  };

  delete = async (id: string) => {
    return await this.instance.delete<{ id: string }>(`/api-keys/${id}`);
  };
}

export const apiKeysApi = new ApiKeysApi();
export { ApiKeysApi };
