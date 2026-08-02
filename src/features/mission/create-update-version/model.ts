import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import {
  Mission,
  MissionGameSide,
  MissionVersion,
  MissionCommentMessage,
  State,
  MissionType,
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
  minSlotsToPlay: number | null;
  attackSideName: string;
  defenseSideName: string;
  enableFriendlySide: boolean;
  friendlySideType: MissionGameSide | null;
  friendlyTo: MissionGameSide | null;
  friendlySideName: string;
  friendlySideSlots: number | null;
  file: File | null;
  attackScreenshots: File[];
  defenseScreenshots: File[];
  friendlyScreenshots: File[];
  removeAttackScreenshotIds: string[];
  removeDefenseScreenshotIds: string[];
  removeFriendlyScreenshotIds: string[];
  attackWeaponry: WeaponryFormItem[];
  defenseWeaponry: WeaponryFormItem[];
  friendlyWeaponry: WeaponryFormItem[];
  inGameTime: string;
  weather: string;
  changelog: MissionCommentMessage | null;
};

const buildInGameTimeDate = (time: string) => {
  if (!time) return null;

  const [hours, minutes] = time.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toISOString();
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

      const { missionId, mission, version } = this.visibility.payload || {};
      if (!missionId) return;

      if (mission?.state === State.ARCHIVED) {
        throw new Error('Неможливо створювати або редагувати версії архівованої місії');
      }

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
        ...(data.enableFriendlySide
          ? data.friendlyWeaponry.map(w => ({
              name: w.name,
              description: w.description || undefined,
              count: w.count,
              type: w.type,
            }))
          : []),
      ];
      const inGameTime = buildInGameTimeDate(data.inGameTime);
      const weather = data.weather.trim() || null;
      const isMiniMission = mission?.missionType === MissionType.mini;
      const minSlotsToPlay =
        isMiniMission && data.minSlotsToPlay !== null && data.minSlotsToPlay > 0 ? data.minSlotsToPlay : null;

      const friendlyPayload =
        data.enableFriendlySide &&
        data.friendlySideType &&
        data.friendlyTo &&
        data.friendlySideName &&
        data.friendlySideSlots != null
          ? {
              friendlySideType: data.friendlySideType,
              friendlyTo: data.friendlyTo,
              friendlySideName: data.friendlySideName,
              friendlySideSlots: data.friendlySideSlots,
            }
          : null;

      if (version) {
        const hadFriendly = Boolean(version.friendlySideType);
        const updateDto: UpdateMissionVersionDto = {
          version: data.version,
          attackSideType: data.attackSideType,
          defenseSideType: data.defenseSideType,
          attackSideSlots: data.attackSideSlots,
          defenseSideSlots: data.defenseSideSlots,
          ...(isMiniMission && { minSlotsToPlay }),
          attackSideName: data.attackSideName,
          defenseSideName: data.defenseSideName,
          weaponry: weaponry.length > 0 ? weaponry : [],
          attackScreenshots: data.attackScreenshots.length > 0 ? data.attackScreenshots : undefined,
          defenseScreenshots: data.defenseScreenshots.length > 0 ? data.defenseScreenshots : undefined,
          friendlyScreenshots:
            data.enableFriendlySide && data.friendlyScreenshots.length > 0
              ? data.friendlyScreenshots
              : undefined,
          removeAttackScreenshotIds:
            data.removeAttackScreenshotIds.length > 0 ? data.removeAttackScreenshotIds : undefined,
          removeDefenseScreenshotIds:
            data.removeDefenseScreenshotIds.length > 0 ? data.removeDefenseScreenshotIds : undefined,
          removeFriendlyScreenshotIds:
            data.removeFriendlyScreenshotIds.length > 0
              ? data.removeFriendlyScreenshotIds
              : undefined,
          inGameTime,
          weather,
          changelog: data.changelog,
          ...(friendlyPayload
            ? friendlyPayload
            : hadFriendly
              ? { clearFriendlySide: true }
              : {}),
        };

        if (data.file) {
          updateDto.file = data.file;
        }

        await api.updateMissionVersion(missionId, version.id, updateDto);
        toast.success('Версію місії оновлено');
      } else {
        if (!data.file) {
          throw new Error("Файл є обов'язковим");
        }

        if (data.enableFriendlySide && !friendlyPayload) {
          throw new Error("Заповніть усі поля третьої сторони");
        }

        await api.createMissionVersion(missionId, {
          version: data.version,
          missionId: missionId,
          attackSideType: data.attackSideType as MissionGameSide,
          defenseSideType: data.defenseSideType as MissionGameSide,
          attackSideSlots: data.attackSideSlots,
          defenseSideSlots: data.defenseSideSlots,
          ...(isMiniMission && minSlotsToPlay !== null && { minSlotsToPlay }),
          attackSideName: data.attackSideName,
          defenseSideName: data.defenseSideName,
          ...(friendlyPayload ?? {}),
          file: data.file,
          attackScreenshots: data.attackScreenshots.length > 0 ? data.attackScreenshots : undefined,
          defenseScreenshots: data.defenseScreenshots.length > 0 ? data.defenseScreenshots : undefined,
          friendlyScreenshots:
            data.enableFriendlySide && data.friendlyScreenshots.length > 0
              ? data.friendlyScreenshots
              : undefined,
          weaponry: weaponry.length > 0 ? weaponry : undefined,
          inGameTime,
          weather,
          changelog: data.changelog,
        });
        toast.success('Версію місії створено');
      }

      if (onSuccess) {
        onSuccess();
      }

      this.visibility.close();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не вдалося зберегти версію');
      throw error;
    } finally {
      this.loader.stop();
    }
  }
}
