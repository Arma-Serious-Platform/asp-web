import { Pagination } from '@/shared/model/pagination';
import { api } from '@/shared/sdk';
import { CreateMissionCommentDto, FindMissionCommentsDto, MissionComment } from '@/shared/sdk/types';
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

  create = async (missionId: string, content: string) => {
    try {
      await api.createMissionComment({
        missionId,
        message: { text: content },
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
}

export { MissionCommentsModel };
