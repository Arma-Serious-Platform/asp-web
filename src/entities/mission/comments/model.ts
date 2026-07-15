import { Pagination } from '@/shared/model/pagination';
import { api } from '@/shared/sdk';
import {
  CreateMissionCommentDto,
  FindMissionCommentsDto,
  MissionComment,
  MissionCommentMessage,
} from '@/shared/sdk/types';
import { MessageComposerSubmitPayload } from '@/features/chat/message-composer/ui';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

class MissionCommentsModel {
  constructor() {
    makeAutoObservable(this);
  }

  pagination = new Pagination<MissionComment, FindMissionCommentsDto, unknown>({
    api: api.findMissionComments,
  });

  init = async (missionId: string, take = 25) => {
    await this.pagination.init({ missionId, take });
  };

  create = async (missionId: string, message: MissionCommentMessage, attachments: File[] = []) => {
    try {
      await api.createMissionComment({
        missionId,
        message,
        ...(attachments.length > 0 && { attachments }),
      });
      toast.success('Коментар додано');
      await this.pagination.init({
        missionId,
        take: (this.pagination.params as FindMissionCommentsDto).take ?? 25,
      });
    } catch {
      toast.error('Не вдалося додати коментар');
      throw new Error('Failed to create comment');
    }
  };

  update = async (commentId: string, missionId: string, payload: MessageComposerSubmitPayload) => {
    try {
      await api.updateMissionComment(commentId, {
        message: payload.lexicalState,
        attachments: payload.attachments,
        removedAttachmentIds: payload.removedAttachmentIds,
      });
      toast.success('Коментар оновлено');
      await this.pagination.init({
        missionId,
        take: (this.pagination.params as FindMissionCommentsDto).take ?? 25,
      });
    } catch {
      toast.error('Не вдалося оновити коментар');
      throw new Error('Failed to update comment');
    }
  };

  remove = async (missionId: string, commentId: string) => {
    try {
      await api.deleteMissionComment(commentId);
      toast.success('Коментар видалено');
      await this.pagination.init({
        missionId,
        take: (this.pagination.params as FindMissionCommentsDto).take ?? 25,
      });
    } catch {
      toast.error('Не вдалося видалити коментар');
      throw new Error('Failed to delete comment');
    }
  };
}

export { MissionCommentsModel };
