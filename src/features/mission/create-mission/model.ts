import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import { CreateMissionDto } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export type MissionFormData = {
  name: string;
  description: string;
  islandId: string;
  image: File | null;
};

export class CreateMissionModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  visibility = new Visibility();

  async save(data: MissionFormData, imageFile: File | null, onSuccess?: (missionId: string) => void) {
    try {
      this.loader.start();

      const dto: CreateMissionDto = {
        name: data.name,
        description: data.description,
        islandId: data.islandId,
        image: imageFile,
      };

      const response = await api.createMission(dto);

      if (onSuccess) {
        onSuccess(response.data.id);
      }

      toast.success('Місію створено');
      this.visibility.close();
    } catch (error) {
      toast.error('Не вдалося створити місію');
      throw error;
    } finally {
      this.loader.stop();
    }
  }
}
