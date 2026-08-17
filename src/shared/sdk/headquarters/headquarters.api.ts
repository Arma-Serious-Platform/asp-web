'use client';

import {
  ApiModel,
  appendAttachmentUpdateFormData,
  extractUploadFiles,
} from '../api-model';
import type {
  AssignHeadquartersSlotSquadDto,
  CreateHeadquartersCommentDto,
  FindHeadquartersCommentsDto,
  HeadquartersComment,
  HeadquartersGamePlan,
  HeadquartersSlot,
  UpdateHeadquartersCommentDto,
  UpdateHeadquartersGamePlanDto,
  UpdateHeadquartersGamePlanSlotDto,
} from './headquarters.schemas';

export type * from './headquarters.schemas';
export * from './headquarters.schemas';

class HeadquartersApi extends ApiModel {
  findHeadquartersPlansByGame = async (gameId: string) => {
    return await this.instance.get<HeadquartersGamePlan[]>(`/headquarters/games/${gameId}/plans`);
  };

  findHeadquartersPlanById = async (id: string) => {
    return await this.instance.get<HeadquartersGamePlan>(`/headquarters/plans/${id}`);
  };

  updateHeadquartersPlan = async (id: string, dto: UpdateHeadquartersGamePlanDto) => {
    return await this.instance.patch<HeadquartersGamePlan>(`/headquarters/plans/${id}`, dto);
  };

  assignHeadquartersCommander = async (id: string) => {
    return await this.instance.post<HeadquartersGamePlan>(`/headquarters/plans/${id}/assign-commander`);
  };

  unassignHeadquartersCommander = async (id: string) => {
    return await this.instance.post<HeadquartersGamePlan>(`/headquarters/plans/${id}/unassign-commander`);
  };

  assignHeadquartersHqSquad = async (id: string) => {
    return await this.instance.post<HeadquartersGamePlan>(`/headquarters/plans/${id}/assign-hq-squad`);
  };

  unassignHeadquartersHqSquad = async (id: string) => {
    return await this.instance.post<HeadquartersGamePlan>(`/headquarters/plans/${id}/unassign-hq-squad`);
  };

  updateHeadquartersSlot = async (slotId: string, dto: UpdateHeadquartersGamePlanSlotDto) => {
    return await this.instance.patch<HeadquartersSlot>(`/headquarters/slots/${slotId}`, dto);
  };

  assignHeadquartersSlotSquad = async (slotId: string, dto: AssignHeadquartersSlotSquadDto) => {
    return await this.instance.post<HeadquartersSlot>(`/headquarters/slots/${slotId}/assign-squad`, dto);
  };

  unassignHeadquartersSlotSquad = async (slotId: string, dto: AssignHeadquartersSlotSquadDto) => {
    return await this.instance.post<HeadquartersSlot>(`/headquarters/slots/${slotId}/unassign-squad`, dto);
  };

  assignHeadquartersSlotWantedSquad = async (slotId: string) => {
    return await this.instance.post<HeadquartersSlot>(`/headquarters/slots/${slotId}/wanted-squads/assign`);
  };

  unassignHeadquartersSlotWantedSquad = async (slotId: string) => {
    return await this.instance.post<HeadquartersSlot>(`/headquarters/slots/${slotId}/wanted-squads/unassign`);
  };

  findHeadquartersComments = async (gamePlanId: string, dto: FindHeadquartersCommentsDto = {}) => {
    return await this.instance.get<{ data: HeadquartersComment[]; total: number }>(
      `/headquarters/plans/${gamePlanId}/comments`,
      {
        params: dto,
      },
    );
  };

  createHeadquartersComment = async (gamePlanId: string, dto: CreateHeadquartersCommentDto) => {
    const { attachments, ...body } = dto;
    const files = extractUploadFiles(attachments);

    if (files.length > 0) {
      const formData = new FormData();
      formData.append('message', JSON.stringify(body.message));
      if (body.replyId) {
        formData.append('replyId', body.replyId);
      }
      files.forEach(file => {
        formData.append('attachments', file);
      });

      return await this.instance.post<HeadquartersComment>(`/headquarters/plans/${gamePlanId}/comments`, formData);
    }

    return await this.instance.post<HeadquartersComment>(`/headquarters/plans/${gamePlanId}/comments`, body);
  };

  updateHeadquartersComment = async (id: string, dto: UpdateHeadquartersCommentDto) => {
    const { attachments, removedAttachmentIds, ...body } = dto;
    const files = extractUploadFiles(attachments);

    if (files.length > 0) {
      const formData = new FormData();
      appendAttachmentUpdateFormData(formData, { message: body.message, removedAttachmentIds }, files);
      if (body.replyId !== undefined) {
        formData.append('replyId', body.replyId ?? '');
      }
      return await this.instance.patch<HeadquartersComment>(`/headquarters/comments/${id}`, formData);
    }

    return await this.instance.patch<HeadquartersComment>(`/headquarters/comments/${id}`, {
      ...body,
      ...(removedAttachmentIds?.length ? { removedAttachmentIds } : {}),
    });
  };

  deleteHeadquartersComment = async (id: string) => {
    return await this.instance.delete<{ message: string }>(`/headquarters/comments/${id}`);
  };
}

export const headquartersApi = new HeadquartersApi();
export { HeadquartersApi };
