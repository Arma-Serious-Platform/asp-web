import { Loader } from '@/shared/state/loader';
import { Visibility } from '@/shared/state/visibility';
import { missionsApi } from '@/shared/sdk';
import { MissionStatus, MissionVersion } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';
import { MissionModel } from '@/entities/mission/mission.model';

export class ChangeMissionVersionStatusState {
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
      await missionsApi.changeMissionVersionStatus(missionId, versionId, status);

      if (onSuccess) {
        onSuccess(status);
      }

      toast.success(`Статус версії змінено на "${MissionModel.statusLabels[status]}"`);
      this.visibility.close();
    } catch {
      toast.error('Не вдалося змінити статус версії місії');
    } finally {
      this.loader.stop();
    }
  }
}
