import { MissionGameSide, SideType } from '@/shared/sdk/types';

export function resolveMissionSideColor(sideType?: MissionGameSide | SideType) {
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
}
