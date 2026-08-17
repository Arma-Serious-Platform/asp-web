'use client';

import {
  ApiModel,
  appendAttachmentUpdateFormData,
  appendFormDataValue,
  appendStringArrayToFormData,
  extractUploadFiles,
  type MissionStatus,
  type PaginatedResponse,
} from '../api-model';
import type {
  ChangeMissionStateDto,
  CreateMissionCommentDto,
  CreateMissionDto,
  CreateMissionVersionDto,
  FindMissionCommentsDto,
  FindMissionsDto,
  Mission,
  MissionComment,
  MissionVersion,
  UpdateMissionCommentDto,
  UpdateMissionDto,
  UpdateMissionVersionDto,
} from './missions.schemas';

export type * from './missions.schemas';
export * from './missions.schemas';

class MissionsApi extends ApiModel {
  findMissions = async (dto: FindMissionsDto) => {
    return await this.instance.get<PaginatedResponse<Mission>>('/missions', {
      params: dto,
    });
  };

  findMissionById = async (missionId: string) => {
    return await this.instance.get<Mission>(`/missions/${missionId}`);
  };

  createMission = async (dto: CreateMissionDto) => {
    const formData = new FormData();
    if (dto.image) {
      formData.append('image', dto.image);
    }

    formData.append('name', dto.name);
    appendFormDataValue(formData, 'description', dto.description);
    formData.append('islandId', dto.islandId);
    formData.append('missionType', dto.missionType);
    if (dto.missionObjective) {
      formData.append('missionObjective', dto.missionObjective);
    }
    appendStringArrayToFormData(formData, 'coauthorIds', dto.coauthorIds);

    return await this.instance.post<Mission>('/missions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  updateMission = async ({ id, ...dto }: UpdateMissionDto) => {
    const formData = new FormData();
    if (dto.image) {
      formData.append('image', dto.image);
    }

    if (dto.islandId) {
      formData.append('islandId', dto.islandId);
    }

    if (dto.name) {
      formData.append('name', dto.name);
    }
    if (dto.description) {
      appendFormDataValue(formData, 'description', dto.description);
    }

    if (dto.missionType) {
      formData.append('missionType', dto.missionType);
    }

    if (dto.missionObjective) {
      formData.append('missionObjective', dto.missionObjective);
    }

    appendStringArrayToFormData(formData, 'coauthorIds', dto.coauthorIds);

    return await this.instance.patch<Mission>(`/missions/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  deleteMission = async (id: string) => {
    return await this.instance.delete<void>(`/missions/${id}`);
  };

  changeMissionState = async (id: string, dto: ChangeMissionStateDto) => {
    return await this.instance.patch<Mission>(`/missions/${id}/state`, dto);
  };

  createMissionVersion = async (missionId: string, dto: CreateMissionVersionDto) => {
    const formData = new FormData();
    if (dto.file) {
      formData.append('file', dto.file);
    }

    formData.append('version', dto.version);
    formData.append('missionId', missionId);
    formData.append('attackSideType', dto.attackSideType);
    formData.append('defenseSideType', dto.defenseSideType);
    formData.append('attackSideSlots', dto.attackSideSlots.toString());
    formData.append('defenseSideSlots', dto.defenseSideSlots.toString());
    formData.append('attackSideName', dto.attackSideName);
    formData.append('defenseSideName', dto.defenseSideName);

    if (dto.friendlySideType) {
      formData.append('friendlySideType', dto.friendlySideType);
    }
    if (dto.friendlyTo) {
      formData.append('friendlyTo', dto.friendlyTo);
    }
    if (dto.friendlySideName) {
      formData.append('friendlySideName', dto.friendlySideName);
    }
    if (dto.friendlySideSlots !== undefined && dto.friendlySideSlots !== null) {
      formData.append('friendlySideSlots', dto.friendlySideSlots.toString());
    }

    if (dto.minSlotsToPlay !== undefined && dto.minSlotsToPlay !== null) {
      formData.append('minSlotsToPlay', dto.minSlotsToPlay.toString());
    }

    if (dto.weaponry && dto.weaponry.length > 0) {
      dto.weaponry.forEach((weaponry, index) => {
        formData.append(`weaponry[${index}][name]`, weaponry.name);
        formData.append(`weaponry[${index}][count]`, weaponry.count.toString());
        formData.append(`weaponry[${index}][type]`, weaponry.type);
        if (weaponry.description) {
          formData.append(`weaponry[${index}][description]`, weaponry.description);
        }
      });
    }

    if (dto.attackScreenshots?.length) {
      dto.attackScreenshots.forEach(file => {
        formData.append('attackScreenshots', file);
      });
    }

    if (dto.defenseScreenshots?.length) {
      dto.defenseScreenshots.forEach(file => {
        formData.append('defenseScreenshots', file);
      });
    }

    if (dto.friendlyScreenshots?.length) {
      dto.friendlyScreenshots.forEach(file => {
        formData.append('friendlyScreenshots', file);
      });
    }

    if (dto.rating !== undefined) {
      formData.append('rating', dto.rating.toString());
    }

    appendFormDataValue(formData, 'inGameTime', dto.inGameTime);
    appendFormDataValue(formData, 'weather', dto.weather);
    appendFormDataValue(formData, 'changelog', dto.changelog);

    return await this.instance.post<MissionVersion>(`/missions/${missionId}/versions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  updateMissionVersion = async (missionId: string, versionId: string, dto: UpdateMissionVersionDto) => {
    const formData = new FormData();
    if (dto.file) {
      formData.append('file', dto.file);
    }

    if (dto.version) {
      formData.append('version', dto.version);
    }
    if (dto.attackSideType) {
      formData.append('attackSideType', dto.attackSideType);
    }
    if (dto.defenseSideType) {
      formData.append('defenseSideType', dto.defenseSideType);
    }
    if (dto.attackSideSlots !== undefined) {
      formData.append('attackSideSlots', dto.attackSideSlots.toString());
    }
    if (dto.defenseSideSlots !== undefined) {
      formData.append('defenseSideSlots', dto.defenseSideSlots.toString());
    }
    if (dto.minSlotsToPlay !== undefined) {
      formData.append('minSlotsToPlay', dto.minSlotsToPlay === null ? '' : dto.minSlotsToPlay.toString());
    }
    if (dto.attackSideName) {
      formData.append('attackSideName', dto.attackSideName);
    }
    if (dto.defenseSideName) {
      formData.append('defenseSideName', dto.defenseSideName);
    }
    if (dto.clearFriendlySide) {
      formData.append('clearFriendlySide', 'true');
    }
    if (dto.friendlySideType !== undefined && dto.friendlySideType !== null) {
      formData.append('friendlySideType', dto.friendlySideType);
    }
    if (dto.friendlyTo !== undefined && dto.friendlyTo !== null) {
      formData.append('friendlyTo', dto.friendlyTo);
    }
    if (dto.friendlySideName !== undefined && dto.friendlySideName !== null) {
      formData.append('friendlySideName', dto.friendlySideName);
    }
    if (dto.friendlySideSlots !== undefined && dto.friendlySideSlots !== null) {
      formData.append('friendlySideSlots', dto.friendlySideSlots.toString());
    }

    if (dto.weaponry !== undefined) {
      if (dto.weaponry.length > 0) {
        dto.weaponry.forEach((weaponry, index) => {
          formData.append(`weaponry[${index}][name]`, weaponry.name);
          formData.append(`weaponry[${index}][count]`, weaponry.count.toString());
          formData.append(`weaponry[${index}][type]`, weaponry.type);
          if (weaponry.description) {
            formData.append(`weaponry[${index}][description]`, weaponry.description);
          }
        });
      } else {
        formData.append('weaponry', '[]');
      }
    }

    if (dto.attackScreenshots?.length) {
      dto.attackScreenshots.forEach(file => {
        formData.append('attackScreenshots', file);
      });
    }

    if (dto.defenseScreenshots?.length) {
      dto.defenseScreenshots.forEach(file => {
        formData.append('defenseScreenshots', file);
      });
    }

    if (dto.friendlyScreenshots?.length) {
      dto.friendlyScreenshots.forEach(file => {
        formData.append('friendlyScreenshots', file);
      });
    }

    if (dto.removeAttackScreenshotIds?.length) {
      dto.removeAttackScreenshotIds.forEach((id, index) => {
        formData.append(`removeAttackScreenshotIds[${index}]`, id);
      });
    }

    if (dto.removeDefenseScreenshotIds?.length) {
      dto.removeDefenseScreenshotIds.forEach((id, index) => {
        formData.append(`removeDefenseScreenshotIds[${index}]`, id);
      });
    }

    if (dto.removeFriendlyScreenshotIds?.length) {
      dto.removeFriendlyScreenshotIds.forEach((id, index) => {
        formData.append(`removeFriendlyScreenshotIds[${index}]`, id);
      });
    }

    if (dto.rating !== undefined) {
      formData.append('rating', dto.rating.toString());
    }

    appendFormDataValue(formData, 'inGameTime', dto.inGameTime);
    appendFormDataValue(formData, 'weather', dto.weather);
    appendFormDataValue(formData, 'changelog', dto.changelog);

    return await this.instance.patch<MissionVersion>(`/missions/${missionId}/versions/${versionId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  changeMissionVersionStatus = async (missionId: string, versionId: string, status: MissionStatus) => {
    return await this.instance.post(`/missions/${missionId}/versions/${versionId}/change-status`, {
      status,
    });
  };

  deleteMissionVersion = async (missionId: string, versionId: string) => {
    return await this.instance.delete<void>(`/missions/${missionId}/versions/${versionId}`);
  };

  findMissionComments = async (dto: FindMissionCommentsDto = {}) => {
    return await this.instance.get<PaginatedResponse<MissionComment>>('/mission-comments', {
      params: dto,
    });
  };

  createMissionComment = async (dto: CreateMissionCommentDto) => {
    const { attachments, ...body } = dto;
    const files = extractUploadFiles(attachments);

    if (files.length > 0) {
      const formData = new FormData();
      formData.append('missionId', body.missionId);
      formData.append('message', JSON.stringify(body.message));
      files.forEach(file => {
        formData.append('attachments', file);
      });

      return await this.instance.post<MissionComment>('/mission-comments', formData);
    }

    return await this.instance.post<MissionComment>('/mission-comments', body);
  };

  findMissionCommentById = async (id: string) => {
    return await this.instance.get<MissionComment>(`/mission-comments/${id}`);
  };

  updateMissionComment = async (id: string, dto: UpdateMissionCommentDto) => {
    const { attachments, removedAttachmentIds, ...body } = dto;
    const files = extractUploadFiles(attachments);

    if (files.length > 0) {
      const formData = new FormData();
      appendAttachmentUpdateFormData(formData, { message: body.message, removedAttachmentIds }, files);
      return await this.instance.patch<MissionComment>(`/mission-comments/${id}`, formData);
    }

    return await this.instance.patch<MissionComment>(`/mission-comments/${id}`, {
      ...body,
      ...(removedAttachmentIds?.length ? { removedAttachmentIds } : {}),
    });
  };

  deleteMissionComment = async (id: string) => {
    return await this.instance.delete(`/mission-comments/${id}`);
  };
}

export const missionsApi = new MissionsApi();
export { MissionsApi };
