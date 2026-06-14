import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import { MissionStatus, MissionVersion } from '@/shared/sdk/types';
import { statusLabels } from '@/entities/mission/lib';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class ChangeMissionVersionStatusModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  visibility = new Visibility<{
    missionId: string;
    version: MissionVersion;
    status: MissionStatus;
  }>();

  async changeStatus(
    missionId: string,
    versionId: string,
    status: MissionStatus,
    onSuccess?: (status: MissionStatus) => void,
  ) {
    try {
      this.loader.start();
      await api.changeMissionVersionStatus(missionId, versionId, status);

      if (onSuccess) {
        onSuccess(status);
      }

      toast.success(`Статус версії змінено на "${statusLabels[status]}"`);
      this.visibility.close();
    } catch {
      toast.error('Не вдалося змінити статус версії місії');
    } finally {
      this.loader.stop();
    }
  }
}
