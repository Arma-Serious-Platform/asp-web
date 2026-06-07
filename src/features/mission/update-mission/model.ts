import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import { Mission, MissionCommentMessage, MissionType, UpdateMissionDto } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export type MissionFormData = {
  name: string;
  description: MissionCommentMessage | null;
  islandId: string;
  missionType: MissionType;
  coauthorIds: string[];
  image: File | null;
};

const areStringArraysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;

  const sortedA = [...a].sort();
  const sortedB = [...b].sort();

  return sortedA.every((value, index) => value === sortedB[index]);
};

export class UpdateMissionModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  visibility = new Visibility<{
    mission: Mission;
  }>();

  async save(data: MissionFormData, imageFile: File | null, canUpdateCoauthors = true, onSuccess?: () => void) {
    try {
      this.loader.start();

      const { mission } = this.visibility.payload || {};
      if (!mission) return;

      const dto: UpdateMissionDto = {
        id: mission.id,
      };

      if (data.name !== mission.name) {
        dto.name = data.name;
      }

      if (JSON.stringify(data.description) !== JSON.stringify(mission.description)) {
        dto.description = data.description as MissionCommentMessage;
      }

      if (data.islandId !== mission?.island?.id) {
        dto.islandId = data.islandId;
      }

      if (data.missionType !== mission.missionType) {
        dto.missionType = data.missionType;
      }

      if (imageFile) {
        dto.image = imageFile;
      }

      const currentCoauthorIds = mission.coauthors?.map(coauthor => coauthor.id) ?? [];
      if (canUpdateCoauthors && !areStringArraysEqual(data.coauthorIds, currentCoauthorIds)) {
        dto.coauthorIds = data.coauthorIds;
      }

      await api.updateMission(dto);

      if (onSuccess) {
        onSuccess();
      }

      toast.success('Місію оновлено');
      this.visibility.close();
    } catch (error) {
      toast.error('Не вдалося оновити місію');
      throw error;
    } finally {
      this.loader.stop();
    }
  }
}
