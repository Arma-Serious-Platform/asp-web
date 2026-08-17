'use client';

import { ApiModel } from '../api-model';
import type { User } from '../users/users.schemas';
import type {
  CreateSpecializationDto,
  SetUserSpecializationsDto,
  Specialization,
  UpdateSpecializationDto,
} from './specializations.schemas';

export type * from './specializations.schemas';
export * from './specializations.schemas';

class SpecializationsApi extends ApiModel {
  findSpecializations = async () => {
    return await this.instance.get<Specialization[]>('/specializations');
  };

  findSpecializationById = async (id: string) => {
    return await this.instance.get<Specialization>(`/specializations/${id}`);
  };

  createSpecialization = async (dto: CreateSpecializationDto) => {
    const formData = new FormData();
    formData.append('name', dto.name);
    if (dto.color) {
      formData.append('color', dto.color);
    }
    if (dto.icon) {
      formData.append('icon', dto.icon);
    }

    return await this.instance.post<Specialization>('/specializations', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  updateSpecialization = async ({ id, ...dto }: UpdateSpecializationDto) => {
    const formData = new FormData();

    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value instanceof File ? value : value.toString());
      }
    });

    return await this.instance.patch<Specialization>(`/specializations/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  deleteSpecialization = async (id: string) => {
    return await this.instance.delete<Specialization>(`/specializations/${id}`);
  };

  setUserSpecializations = async ({ userId, specializationIds }: SetUserSpecializationsDto) => {
    return await this.instance.put<User>(`/specializations/users/${userId}`, { specializationIds });
  };
}

export const specializationsApi = new SpecializationsApi();
export { SpecializationsApi };
