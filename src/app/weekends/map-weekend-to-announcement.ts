import type { Game, Weekend } from '@/shared/sdk/types';
import { MissionGameSide } from '@/shared/sdk/types';
import type { GameAnnouncement, GameCombatant, GameUnit, WeekendGame } from '@/features/weekend/model';

const PLACEHOLDER_IMAGE = '/images/hero.jpg';

function missionSideToColor(type: MissionGameSide): 'red' | 'blue' {
  switch (type) {
    case MissionGameSide.RED:
      return 'red';
    case MissionGameSide.BLUE:
    case MissionGameSide.GREEN:
    default:
      return 'blue';
  }
}

function mapWeaponryToUnits(
  weaponry: { name: string; description?: string; count: number; type: MissionGameSide }[] | undefined,
  sideType: MissionGameSide,
): GameUnit[] {
  if (!weaponry?.length) return [];
  return weaponry
    .filter(w => w.type === sideType)
    .map(w => ({ name: w.name, quantity: w.count, details: w.description ?? undefined }));
}

function mapGameToWeekendGame(game: Game): WeekendGame {
  const mv = game.missionVersion;
  const attackSide: GameCombatant = mv
    ? {
        name: mv.attackSideName,
        playerCount: mv.attackSideSlots,
        role: 'attack',
        color: missionSideToColor(mv.attackSideType),
        units: mapWeaponryToUnits(mv.weaponry, mv.attackSideType),
      }
    : {
        name: '—',
        playerCount: 0,
        role: 'attack',
        color: 'red',
        units: [],
      };
  const defenseSide: GameCombatant = mv
    ? {
        name: mv.defenseSideName,
        playerCount: mv.defenseSideSlots,
        role: 'defense',
        color: missionSideToColor(mv.defenseSideType),
        units: mapWeaponryToUnits(mv.weaponry, mv.defenseSideType),
      }
    : {
        name: '—',
        playerCount: 0,
        role: 'defense',
        color: 'blue',
        units: [],
      };

  const nickname = game.admin?.nickname ?? '—';

  return {
    id: game.id,
    title: game.name,
    date: game.date,
    gameDate: game.date,
    image: PLACEHOLDER_IMAGE,
    combatants: { side1: attackSide, side2: defenseSide },
    description: mv?.changesDescription ?? '',
    author: { tag: nickname, name: nickname },
    downloadUrl: mv?.file?.url,
  };
}

export function mapWeekendToGameAnnouncement(weekend: Weekend): GameAnnouncement {
  const games: WeekendGame[] = (weekend.games ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map(mapGameToWeekendGame);

  return {
    id: weekend.id,
    announcementDate: weekend.name || weekend.publishedAt || '',
    games,
  };
}
