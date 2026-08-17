import { createEntity } from '@/shared/state/entity';
import {
  MissionGameSide,
  MissionObjective,
  MissionSchema,
  MissionStatus,
  MissionType,
  MissionVersion,
  SideType,
  State,
} from '@/shared/sdk/types';
import { makeObservable, computed } from 'mobx';

type RawMissionVersion = MissionVersion & Record<string, unknown>;
type SideKey = 'attack' | 'defense' | 'friendly';

class MissionModel extends createEntity(MissionSchema) {
  static statusLabels: Record<MissionStatus, string> = {
    [MissionStatus.APPROVED]: 'Перевірено',
    [MissionStatus.PENDING_APPROVAL]: 'Очікує перевірки',
    [MissionStatus.CHANGES_REQUESTED]: 'Потребує змін',
    [MissionStatus.IN_REVIEW]: 'На перевірці',
    [MissionStatus.PENDING_GAME_APPROVAL]: 'Очікує ігрової перевірки',
  };

  static statusColors: Record<MissionStatus, string> = {
    [MissionStatus.APPROVED]:
      'border border-green-500/50 bg-green-950/90 text-green-100 shadow-sm shadow-black/20',
    [MissionStatus.PENDING_APPROVAL]:
      'border border-amber-500/50 bg-amber-950/90 text-amber-100 shadow-sm shadow-black/20',
    [MissionStatus.CHANGES_REQUESTED]:
      'border border-red-500/50 bg-red-950/90 text-red-100 shadow-sm shadow-black/20',
    [MissionStatus.IN_REVIEW]:
      'border border-sky-500/50 bg-sky-950/90 text-sky-100 shadow-sm shadow-black/20',
    [MissionStatus.PENDING_GAME_APPROVAL]:
      'border border-violet-500/50 bg-violet-950/90 text-violet-100 shadow-sm shadow-black/20',
  };

  /** Text/icon color only (e.g. popover menu icons). */
  static statusTextColors: Record<MissionStatus, string> = {
    [MissionStatus.APPROVED]: 'text-green-300',
    [MissionStatus.PENDING_APPROVAL]: 'text-amber-200',
    [MissionStatus.CHANGES_REQUESTED]: 'text-red-300',
    [MissionStatus.IN_REVIEW]: 'text-sky-300',
    [MissionStatus.PENDING_GAME_APPROVAL]: 'text-violet-300',
  };

  static sideTypeColors: Record<MissionGameSide, string> = {
    [MissionGameSide.BLUE]: 'text-blue-400',
    [MissionGameSide.RED]: 'text-red-400',
    [MissionGameSide.GREEN]: 'text-green-400',
  };

  static statusOptions = [
    { label: 'Всі статуси', value: '' },
    { label: 'Перевірено', value: MissionStatus.APPROVED },
    { label: 'Очікує перевірки', value: MissionStatus.PENDING_APPROVAL },
    { label: 'На перевірці', value: MissionStatus.IN_REVIEW },
    { label: 'Очікує ігрової перевірки', value: MissionStatus.PENDING_GAME_APPROVAL },
    { label: 'Потребує змін', value: MissionStatus.CHANGES_REQUESTED },
  ];

  static missionTypeLabels: Record<MissionType, string> = {
    [MissionType.SG]: 'VTG',
    [MissionType.mini]: 'mVTG',
  };

  static missionTypeOptions = [
    { label: 'Всі типи', value: '' },
    { label: MissionModel.missionTypeLabels[MissionType.SG], value: MissionType.SG },
    { label: MissionModel.missionTypeLabels[MissionType.mini], value: MissionType.mini },
  ];

  static missionObjectiveLabels: Record<MissionObjective, string> = {
    [MissionObjective.ATTACK_DEFEND]: 'Атака / Захист',
    [MissionObjective.ENCOUTER_BATTLE]: 'Зустрічний бій',
  };

  static missionObjectiveOptions = [
    { label: 'Всі типи боїв', value: '' },
    {
      label: MissionModel.missionObjectiveLabels[MissionObjective.ATTACK_DEFEND],
      value: MissionObjective.ATTACK_DEFEND,
    },
    {
      label: MissionModel.missionObjectiveLabels[MissionObjective.ENCOUTER_BATTLE],
      value: MissionObjective.ENCOUTER_BATTLE,
    },
  ];

  static stateLabels: Record<State, string> = {
    [State.ACTIVE]: 'Активні',
    [State.ARCHIVED]: 'Архівовані',
  };

  static stateOptions = [
    { label: 'Всі стани', value: '' },
    { label: MissionModel.stateLabels[State.ACTIVE], value: State.ACTIVE },
    { label: MissionModel.stateLabels[State.ARCHIVED], value: State.ARCHIVED },
  ];

  static resolveMissionSideColor = (sideType?: MissionGameSide | SideType | string) => {
    if (sideType === MissionGameSide.RED || sideType === SideType.RED) {
      return {
        dot: 'bg-red-500',
        text: 'text-red-500',
        soft: 'bg-red-500/20 text-red-400',
        accent: 'text-red-400 border-red-500/30',
      };
    }

    if (sideType === MissionGameSide.BLUE || sideType === SideType.BLUE) {
      return {
        dot: 'bg-blue-500',
        text: 'text-blue-500',
        soft: 'bg-blue-500/20 text-blue-400',
        accent: 'text-blue-400 border-blue-500/30',
      };
    }

    if (sideType === MissionGameSide.GREEN) {
      return {
        dot: 'bg-green-500',
        text: 'text-green-500',
        soft: 'bg-green-500/20 text-green-400',
        accent: 'text-green-400 border-green-500/30',
      };
    }

    return {
      dot: 'bg-zinc-500',
      text: 'text-zinc-300',
      soft: 'bg-zinc-500/20 text-zinc-300',
      accent: 'text-zinc-300 border-zinc-500/30',
    };
  };

  private static normalizeScreenshotList = (
    raw: unknown,
  ): NonNullable<MissionVersion['attackScreenshots']> => {
    if (!Array.isArray(raw)) return [];

    return raw
      .map((item: any, index) => {
        const url = item?.url || item?.file?.url || item?.screenshot?.url || item?.path;
        const id = item?.id || item?.fileId || item?.screenshotId || `${url || 'screenshot'}-${index}`;

        if (!url || typeof url !== 'string') {
          return null;
        }

        return {
          id: String(id),
          url,
        };
      })
      .filter(Boolean) as NonNullable<MissionVersion['attackScreenshots']>;
  };

  private static getSideScreenshotsFromSharedList = (
    shared: unknown,
    side: SideKey,
    sideType: MissionGameSide | null | undefined,
  ) => {
    if (!Array.isArray(shared) || !sideType) {
      return [];
    }

    const sideTokens = [
      side,
      sideType,
      sideType?.toLowerCase?.(),
      side === 'attack' ? 'attacker' : side === 'defense' ? 'defender' : 'ally',
      side === 'friendly' ? 'ally' : null,
    ].filter(Boolean);

    return MissionModel.normalizeScreenshotList(
      shared.filter((item: any) => {
        const marker = String(
          item?.sideType || item?.side || item?.team || item?.type || item?.screenshotType || item?.role || '',
        ).toLowerCase();

        const isAttackFlag = item?.isAttack;
        if (typeof isAttackFlag === 'boolean') {
          if (side === 'friendly') return false;
          return side === 'attack' ? isAttackFlag : !isAttackFlag;
        }

        return sideTokens.some(token => marker.includes(String(token).toLowerCase()));
      }),
    );
  };

  static resolveUniformScreenshots = (version: MissionVersion) => {
    const rawVersion = version as RawMissionVersion;
    const sharedScreenshots =
      rawVersion.screenshots || rawVersion.uniformScreenshots || rawVersion.missionVersionScreenshots;

    const attackUniformScreenshots =
      MissionModel.normalizeScreenshotList(
        rawVersion.attackScreenshots || rawVersion.attack_screenshots || rawVersion.attackUniformScreenshots,
      ) || [];
    const defenseUniformScreenshots =
      MissionModel.normalizeScreenshotList(
        rawVersion.defenseScreenshots ||
          rawVersion.defense_screenshots ||
          rawVersion.defenseUniformScreenshots,
      ) || [];
    const friendlyUniformScreenshots =
      MissionModel.normalizeScreenshotList(
        rawVersion.friendlyScreenshots ||
          rawVersion.friendly_screenshots ||
          rawVersion.friendlyUniformScreenshots,
      ) || [];

    const attackFromShared = MissionModel.getSideScreenshotsFromSharedList(
      sharedScreenshots,
      'attack',
      version.attackSideType,
    );
    const defenseFromShared = MissionModel.getSideScreenshotsFromSharedList(
      sharedScreenshots,
      'defense',
      version.defenseSideType,
    );
    const friendlyFromShared = MissionModel.getSideScreenshotsFromSharedList(
      sharedScreenshots,
      'friendly',
      version.friendlySideType,
    );

    return {
      attack: attackUniformScreenshots.length > 0 ? attackUniformScreenshots : attackFromShared,
      defense:
        defenseUniformScreenshots.length > 0
          ? defenseUniformScreenshots
          : defenseFromShared.length > 0
            ? defenseFromShared
            : [],
      friendly: friendlyUniformScreenshots.length > 0 ? friendlyUniformScreenshots : friendlyFromShared,
    };
  };

  static getMissionSideRoleLabels = (objective?: MissionObjective | null) => {
    if (objective === MissionObjective.ENCOUTER_BATTLE) {
      return {
        attack: 'Фракція №1',
        defense: 'Фракція №2',
        attackShort: '№1',
        defenseShort: '№2',
        attackTitle: 'Фракція №1',
        defenseTitle: 'Фракція №2',
        attackTypeLabel: 'Тип фракції №1',
        defenseTypeLabel: 'Тип фракції №2',
        attackNameLabel: 'Назва фракції №1',
        defenseNameLabel: 'Назва фракції №2',
        attackSlotsLabel: 'Слоти фракції №1',
        defenseSlotsLabel: 'Слоти фракції №2',
        attackScreenshotsLabel: 'Скріншоти уніформи (фракція №1)',
        defenseScreenshotsLabel: 'Скріншоти уніформи (фракція №2)',
      };
    }

    return {
      attack: 'Атака',
      defense: 'Оборона',
      attackShort: 'атака',
      defenseShort: 'оборона',
      attackTitle: 'Атакуюча фракція',
      defenseTitle: 'Оборонна фракція',
      attackTypeLabel: 'Тип атакуючої фракції',
      defenseTypeLabel: 'Тип оборонної фракції',
      attackNameLabel: 'Назва атакуючої фракції',
      defenseNameLabel: 'Назва оборонної фракції',
      attackSlotsLabel: 'Слоти атакуючої фракції',
      defenseSlotsLabel: 'Слоти оборонної фракції',
      attackScreenshotsLabel: 'Скріншоти уніформи (атака)',
      defenseScreenshotsLabel: 'Скріншоти уніформи (оборона)',
    };
  };

  static formatWeaponrySummary = (weaponry?: { name: string; count: number }[] | null): string => {
    if (!weaponry?.length) return '';

    return weaponry.map(item => `${item.name} ×${item.count}`).join(', ');
  };

  /** Side assignment labels for weekend/game forms: "USMC" or "USMC + UN" when allies exist. */
  static getMissionVersionSideAssignmentLabels = (
    version?: {
      attackSideName: string;
      defenseSideName: string;
      attackSideType: MissionGameSide;
      defenseSideType: MissionGameSide;
      friendlySideName?: string | null;
      friendlyTo?: MissionGameSide | null;
    } | null,
  ) => {
    if (!version) {
      return {
        attack: 'Фракція атаки',
        defense: 'Фракція оборони',
      };
    }

    const allyName = version.friendlySideName?.trim();
    const attack =
      allyName && version.friendlyTo === version.attackSideType
        ? `${version.attackSideName} + ${allyName}`
        : version.attackSideName;
    const defense =
      allyName && version.friendlyTo === version.defenseSideType
        ? `${version.defenseSideName} + ${allyName}`
        : version.defenseSideName;

    return { attack, defense };
  };

  protected init() {
    makeObservable(this, {
      id: computed,
      name: computed,
      isArchived: computed,
    });
  }

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }

  get isArchived() {
    return this.data.state === State.ARCHIVED;
  }
}

export { MissionModel };
