'use client';

import { ApiModel, appendFormDataValue, type PaginatedResponse } from '../api-model';
import type { CreateNewsDto, FindNewsDto, News, UpdateNewsDto } from './news.schemas';

export type * from './news.schemas';
export * from './news.schemas';

class NewsApi extends ApiModel {
  findNews = async (dto: FindNewsDto = {}) => {
    return await this.instance.get<PaginatedResponse<News>>('/news', { params: dto });
  };

  findNewsById = async (id: string) => {
    return await this.instance.get<News>(`/news/${id}`);
  };

  findAdminNews = async (dto: FindNewsDto = {}) => {
    return await this.instance.get<PaginatedResponse<News>>('/news/admin', { params: dto });
  };

  findAdminNewsById = async (id: string) => {
    return await this.instance.get<News>(`/news/admin/${id}`);
  };

  uploadNewsMedia = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return await this.instance.post<{ id: string; url: string; filename?: string }>(
      '/news/admin/media',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
  };

  createNews = async (dto: CreateNewsDto) => {
    const formData = new FormData();
    formData.append('title', dto.title);
    formData.append('content', JSON.stringify(dto.content));
    if (dto.shortDescription !== undefined && dto.shortDescription !== null) {
      formData.append('shortDescription', JSON.stringify(dto.shortDescription));
    }
    if (dto.published !== undefined) {
      formData.append('published', String(dto.published));
    }
    if (dto.type) {
      formData.append('type', dto.type);
    }
    if (dto.date) {
      formData.append('date', dto.date);
    }
    if (dto.image) {
      formData.append('image', dto.image);
    }
    dto.attachments?.forEach(file => {
      formData.append('attachments', file);
    });

    return await this.instance.post<News>('/news', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  updateNews = async ({ id, ...dto }: UpdateNewsDto) => {
    const formData = new FormData();
    if (dto.title !== undefined) formData.append('title', dto.title);
    if (dto.content !== undefined) formData.append('content', JSON.stringify(dto.content));
    if (dto.shortDescription !== undefined && dto.shortDescription !== null) {
      formData.append('shortDescription', JSON.stringify(dto.shortDescription));
    }
    if (dto.published !== undefined) formData.append('published', String(dto.published));
    if (dto.type !== undefined) formData.append('type', dto.type);
    if (dto.date !== undefined) formData.append('date', dto.date);
    if (dto.removeImage !== undefined) formData.append('removeImage', String(dto.removeImage));
    if (dto.image) formData.append('image', dto.image);
    if (dto.removedAttachmentIds?.length) {
      appendFormDataValue(formData, 'removedAttachmentIds', dto.removedAttachmentIds);
    }
    dto.attachments?.forEach(file => {
      formData.append('attachments', file);
    });

    return await this.instance.patch<News>(`/news/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  deleteNews = async (id: string) => {
    return await this.instance.delete<{ message: string }>(`/news/${id}`);
  };
}

export const newsApi = new NewsApi();
export { NewsApi };
