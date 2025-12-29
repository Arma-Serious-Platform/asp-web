import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import { Mission, UpdateMissionDto } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export type MissionFormData = {
  name: string;
  description: string;
  image: File | null;
};

export class UpdateMissionModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  visibility = new Visibility<{
    mission: Mission;
  }>();

  async save(
    data: MissionFormData,
    imageFile: File | null,
    onSuccess?: () => void
  ) {
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
      if (data.description !== mission.description) {
        dto.description = data.description;
      }
      if (imageFile) {
        dto.image = imageFile;
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

