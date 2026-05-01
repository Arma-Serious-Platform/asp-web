import { MissionVersion } from '@/shared/sdk/types';

type RawMissionVersion = MissionVersion & Record<string, unknown>;

export const normalizeScreenshotList = (raw: unknown): NonNullable<MissionVersion['attackScreenshots']> => {
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

const getSideScreenshotsFromSharedList = (
  shared: unknown,
  side: 'attack' | 'defense',
  sideType: MissionVersion['attackSideType'] | MissionVersion['defenseSideType'],
) => {
  if (!Array.isArray(shared)) {
    return [];
  }

  const sideTokens = [side, sideType, sideType?.toLowerCase?.(), side === 'attack' ? 'attacker' : 'defender'].filter(
    Boolean,
  );

  return normalizeScreenshotList(
    shared.filter((item: any) => {
      const marker = String(
        item?.sideType || item?.side || item?.team || item?.type || item?.screenshotType || item?.role || '',
      ).toLowerCase();

      const isAttackFlag = item?.isAttack;
      if (typeof isAttackFlag === 'boolean') {
        return side === 'attack' ? isAttackFlag : !isAttackFlag;
      }

      return sideTokens.some(token => marker.includes(String(token).toLowerCase()));
    }),
  );
};

export const resolveUniformScreenshots = (version: MissionVersion) => {
  const rawVersion = version as RawMissionVersion;
  const sharedScreenshots =
    rawVersion.screenshots || rawVersion.uniformScreenshots || rawVersion.missionVersionScreenshots;

  const attackUniformScreenshots =
    normalizeScreenshotList(
      rawVersion.attackScreenshots || rawVersion.attack_screenshots || rawVersion.attackUniformScreenshots,
    ) || [];
  const defenseUniformScreenshots =
    normalizeScreenshotList(
      rawVersion.defenseScreenshots || rawVersion.defense_screenshots || rawVersion.defenseUniformScreenshots,
    ) || [];

  const attackFromShared = getSideScreenshotsFromSharedList(sharedScreenshots, 'attack', version.attackSideType);
  const defenseFromShared = getSideScreenshotsFromSharedList(sharedScreenshots, 'defense', version.defenseSideType);
  const allSharedScreenshots = normalizeScreenshotList(sharedScreenshots);

  return {
    attack:
      attackUniformScreenshots.length > 0
        ? attackUniformScreenshots
        : attackFromShared.length > 0
          ? attackFromShared
          : allSharedScreenshots,
    defense:
      defenseUniformScreenshots.length > 0
        ? defenseUniformScreenshots
        : defenseFromShared.length > 0
          ? defenseFromShared
          : allSharedScreenshots,
  };
};
