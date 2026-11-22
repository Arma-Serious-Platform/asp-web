'use client';

import { ApiModel } from '../api-model';
import type {
  CreateTribunalComplaintDto,
  ResolveTribunalComplaintDto,
  FindTribunalComplaintsParams,
  TribunalComplaint,
  TribunalComplaintDetails,
  TribunalComplaintList,
  TribunalFilters,
  TribunalGameOption,
  TribunalMessage,
} from './tribunal.schemas';

export type * from './tribunal.schemas';
export * from './tribunal.schemas';

class TribunalApi extends ApiModel {
  findComplaints = async (params: FindTribunalComplaintsParams = {}) => {
    return await this.instance.get<TribunalComplaintList>('/tribunal', { params });
  };

  findFilters = async () => {
    return await this.instance.get<TribunalFilters>('/tribunal/filters');
  };

  findGames = async () => {
    return await this.instance.get<TribunalGameOption[]>('/tribunal/games');
  };

  findAdmins = async () => {
    return await this.instance.get<{ id: string; nickname: string }[]>('/tribunal/admins');
  };

  findComplaint = async (id: string) => {
    return await this.instance.get<TribunalComplaintDetails>(`/tribunal/${id}`);
  };

  createComplaint = async (dto: CreateTribunalComplaintDto) => {
    return await this.instance.post<TribunalComplaint>('/tribunal', dto);
  };

  uploadAttachments = async (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('attachments', file));

    return await this.instance.post<TribunalComplaintDetails>(`/tribunal/${id}/attachments`, formData);
  };

  setRule = async (id: string, dto: { ruleNumber: string; ruleText: string }) => {
    return await this.instance.post<TribunalComplaintDetails>(`/tribunal/${id}/rule`, dto);
  };

  createMessage = async (id: string, body: string) => {
    return await this.instance.post<TribunalMessage>(`/tribunal/${id}/messages`, { body });
  };

  deleteMessage = async (id: string, messageId: string) => {
    return await this.instance.delete<{ id: string }>(`/tribunal/${id}/messages/${messageId}`);
  };

  assignComplaint = async (id: string, assigneeId: string) => {
    return await this.instance.post<TribunalComplaintDetails>(`/tribunal/${id}/assign`, { assigneeId });
  };

  resolveComplaint = async (id: string, dto: ResolveTribunalComplaintDto) => {
    return await this.instance.post<TribunalComplaintDetails>(`/tribunal/${id}/resolve`, dto);
  };
}

export const tribunalApi = new TribunalApi();
export { TribunalApi };
