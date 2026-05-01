import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import {
  Mission,
  MissionGameSide,
  MissionVersion,
  CreateMissionVersionDto,
  UpdateMissionVersionDto,
  CreateMissionWeaponryDto,
} from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export type WeaponryFormItem = {
  name: string;
  description: string;
  count: number;
  type: MissionGameSide;
};

export type VersionFormData = {
  version: string;
  missionId: string;
  attackSideType: MissionGameSide;
  defenseSideType: MissionGameSide;
  attackSideSlots: number;
  defenseSideSlots: number;
  attackSideName: string;
  defenseSideName: string;
  file: File | null;
  attackScreenshots: File[];
  defenseScreenshots: File[];
  removeAttackScreenshotIds: string[];
  removeDefenseScreenshotIds: string[];
  attackWeaponry: WeaponryFormItem[];
  defenseWeaponry: WeaponryFormItem[];
};

export class CreateUpdateMissionVersionModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  visibility = new Visibility<{
    missionId: string;
    mission: Mission;
    version?: MissionVersion;
  }>();

  async save(data: VersionFormData, onSuccess?: () => void) {
    try {
      this.loader.start();

      const { missionId, version } = this.visibility.payload || {};
      if (!missionId) return;

      const weaponry: CreateMissionWeaponryDto[] = [
        ...data.attackWeaponry.map(w => ({
          name: w.name,
          description: w.description || undefined,
          count: w.count,
          type: w.type,
        })),
        ...data.defenseWeaponry.map(w => ({
          name: w.name,
          description: w.description || undefined,
          count: w.count,
          type: w.type,
        })),
      ];

      if (version) {
        // Update existing version
        const updateDto: UpdateMissionVersionDto = {
          version: data.version,
          attackSideType: data.attackSideType,
          defenseSideType: data.defenseSideType,
          attackSideSlots: data.attackSideSlots,
          defenseSideSlots: data.defenseSideSlots,
          attackSideName: data.attackSideName,
          defenseSideName: data.defenseSideName,
          weaponry: weaponry.length > 0 ? weaponry : [],
          attackScreenshots: data.attackScreenshots.length > 0 ? data.attackScreenshots : undefined,
          defenseScreenshots: data.defenseScreenshots.length > 0 ? data.defenseScreenshots : undefined,
          removeAttackScreenshotIds:
            data.removeAttackScreenshotIds.length > 0 ? data.removeAttackScreenshotIds : undefined,
          removeDefenseScreenshotIds:
            data.removeDefenseScreenshotIds.length > 0 ? data.removeDefenseScreenshotIds : undefined,
        };

        if (data.file) {
          updateDto.file = data.file;
        }

        await api.updateMissionVersion(missionId, version.id, updateDto);
        toast.success('Версію місії оновлено');
      } else {
        // Create new version
        if (!data.file) {
          throw new Error("Файл є обов'язковим");
        }

        await api.createMissionVersion(missionId, {
          version: data.version,
          missionId: missionId,
          attackSideType: data.attackSideType as MissionGameSide,
          defenseSideType: data.defenseSideType as MissionGameSide,
          attackSideSlots: data.attackSideSlots,
          defenseSideSlots: data.defenseSideSlots,
          attackSideName: data.attackSideName,
          defenseSideName: data.defenseSideName,
          file: data.file,
          attackScreenshots: data.attackScreenshots.length > 0 ? data.attackScreenshots : undefined,
          defenseScreenshots: data.defenseScreenshots.length > 0 ? data.defenseScreenshots : undefined,
          weaponry: weaponry.length > 0 ? weaponry : undefined,
        });
        toast.success('Версію місії створено');
      }

      if (onSuccess) {
        onSuccess();
      }

      this.visibility.close();
    } catch (error: any) {
      toast.error(error?.message || 'Не вдалося зберегти версію місії');
      throw error;
    } finally {
      this.loader.stop();
    }
  }
}
