'use client';

import {
  ApiModel,
  appendAttachmentUpdateFormData,
  extractUploadFiles,
  type PaginatedResponse,
} from '../api-model';
import type { AddChatMembersDto, Chat, CreateChatDto, UpdateChatMessageDto } from './chat.schemas';

export type * from './chat.schemas';
export * from './chat.schemas';

class ChatApi extends ApiModel {
  findChats = async () => {
    return await this.instance.get<Chat[]>('/chats');
  };

  createChat = async (dto: CreateChatDto) => {
    return await this.instance.post<Chat>('/chats', dto);
  };

  findChatById = async (id: string) => {
    return await this.instance.get<Chat>(`/chats/${id}`);
  };

  updateChat = async (chatId: string, dto: { name: string }) => {
    return await this.instance.patch<Chat>(`/chats/${chatId}`, dto);
  };

  findChatMessages = async (chatId: string, dto: { take?: number; skip?: number } = {}) => {
    return await this.instance.get<PaginatedResponse<unknown>>(`/chats/${chatId}/messages`, {
      params: { take: 500, ...dto },
    });
  };

  sendChatMessage = async (
    chatId: string,
    body?: { content?: unknown; quoteMessageId?: string; attachments?: File[] },
  ) => {
    const files = extractUploadFiles(body?.attachments);

    if (files.length > 0) {
      const formData = new FormData();
      formData.append('content', JSON.stringify(body?.content ?? {}));
      if (body?.quoteMessageId) {
        formData.append('quoteMessageId', body.quoteMessageId);
      }
      files.forEach(file => {
        formData.append('attachments', file);
      });

      return await this.instance.post(`/chats/${chatId}/messages`, formData);
    }

    const { attachments: _attachments, ...jsonBody } = body ?? {};
    return await this.instance.post(`/chats/${chatId}/messages`, jsonBody);
  };

  updateChatMessage = async (chatId: string, messageId: string, dto: UpdateChatMessageDto = {}) => {
    const { attachments, removedAttachmentIds, ...body } = dto;
    const files = extractUploadFiles(attachments);

    if (files.length > 0) {
      const formData = new FormData();
      appendAttachmentUpdateFormData(formData, { content: body.content, removedAttachmentIds }, files);
      return await this.instance.patch(`/chats/${chatId}/messages/${messageId}`, formData);
    }

    return await this.instance.patch(`/chats/${chatId}/messages/${messageId}`, {
      ...body,
      ...(removedAttachmentIds?.length ? { removedAttachmentIds } : {}),
    });
  };

  deleteChatMessage = async (chatId: string, messageId: string) => {
    return await this.instance.delete<{ message: string; id: string; chatId: string }>(
      `/chats/${chatId}/messages/${messageId}`,
    );
  };

  leaveChat = async (chatId: string) => {
    return await this.instance.delete(`/chats/${chatId}/leave`);
  };

  deleteChat = async (chatId: string) => {
    return await this.instance.delete(`/chats/${chatId}`);
  };

  addChatMembers = async (chatId: string, dto: AddChatMembersDto) => {
    return await this.instance.post<Chat>(`/chats/${chatId}/members`, dto);
  };
}

export const chatApi = new ChatApi();
export { ChatApi };
