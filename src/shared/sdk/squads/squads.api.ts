'use client';

import {
  ApiModel,
  appendFormDataValue,
  type PaginatedResponse,
} from '../api-model';
import type { User } from '../users/users.schemas';
import type {
  CreateSquadDto,
  FindSquadsDto,
  InviteToSquadDto,
  Squad,
  SquadInvitation,
  SquadJoinRequest,
  UpdateMySquadDto,
  UpdateSquadDto,
  UpdateSquadMemberRoleDto,
} from './squads.schemas';

export type * from './squads.schemas';
export * from './squads.schemas';

class SquadsApi extends ApiModel {
  createSquad = async (dto: CreateSquadDto) => {
    const formData = new FormData();
    if (dto.logo) {
      formData.append('logo', dto.logo);
    }
    formData.append('name', dto.name);
    formData.append('tag', dto.tag);
    appendFormDataValue(formData, 'description', dto.description);
    formData.append('leaderId', dto.leaderId);
    formData.append('sideId', dto.sideId);
    return await this.instance.post<Squad>('/squads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  updateSquad = async ({ id, ...dto }: UpdateSquadDto) => {
    const formData = new FormData();

    Object.entries(dto).forEach(([key, value]) => appendFormDataValue(formData, key, value));

    return await this.instance.patch<Squad>(`/squads/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  updateMySquad = async (dto: UpdateMySquadDto) => {
    const formData = new FormData();

    Object.entries(dto).forEach(([key, value]) => appendFormDataValue(formData, key, value));

    return await this.instance.patch<Squad>('/squads/me', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  deleteSquad = async (squadId: string) => {
    return await this.instance.delete<Squad>(`/squads/${squadId}`);
  };

  findSquads = async (dto: FindSquadsDto) => {
    return await this.instance.get<PaginatedResponse<Squad>>('/squads', {
      params: dto,
    });
  };

  findSquadById = async (squadId: string) => {
    return await this.instance.get<Squad>(`/squads/${squadId}`);
  };

  inviteToSquad = async (dto: InviteToSquadDto) => {
    return await this.instance.post<SquadInvitation>(`/squads/invite/${dto.userId}`, {
      squadRole: dto.squadRole,
    });
  };

  updateSquadMemberRole = async ({ userId, role }: UpdateSquadMemberRoleDto) => {
    return await this.instance.patch<User>(`/squads/members/${userId}/role`, { role });
  };

  squadInvitations = async () => {
    return await this.instance.get<SquadInvitation[]>('/squads/invitations');
  };

  squadJoinRequests = async () => {
    return await this.instance.get<SquadJoinRequest[]>('/squads/join-requests');
  };

  mySquadJoinRequests = async () => {
    return await this.instance.get<SquadJoinRequest[]>('/squads/join-requests/my');
  };

  requestToJoinSquad = async (squadId: string) => {
    return await this.instance.post<SquadJoinRequest>(`/squads/join-requests/${squadId}`);
  };

  acceptSquadJoinRequest = async (requestId: string) => {
    return await this.instance.post<SquadJoinRequest>(`/squads/join-requests/accept/${requestId}`);
  };

  rejectSquadJoinRequest = async (requestId: string) => {
    return await this.instance.post<SquadJoinRequest>(`/squads/join-requests/reject/${requestId}`);
  };

  acceptSquadInvitation = async (invitationId: string) => {
    return await this.instance.post<SquadInvitation>(`/squads/invitations/accept/${invitationId}`);
  };

  rejectSquadInvitation = async (invitationId: string) => {
    return await this.instance.post<SquadInvitation>(`/squads/invitations/reject/${invitationId}`);
  };

  kickFromSquad = async (userId: string) => {
    return await this.instance.post<void>(`/squads/kick/${userId}`);
  };

  transferSquadLeadership = async (userId: string) => {
    return await this.instance.post<void>(`/squads/leader/${userId}`);
  };

  leaveFromSquad = async (newLeaderId?: string) => {
    return await this.instance.post<void>(`/squads/leave`, { newLeaderId });
  };
}

export const squadsApi = new SquadsApi();
export { SquadsApi };
