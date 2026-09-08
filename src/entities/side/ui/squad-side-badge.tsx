import { FC } from 'react';

import { MissionModel } from '@/entities/mission/mission.model';
import { SideType } from '@/shared/sdk/types';
import { cn } from '@/shared/utils/cn';

type SquadSideBadgeProps = {
  name?: string | null;
  type?: SideType | string | null;
  className?: string;
  size?: 'default' | 'compact';
};

/** Square top-right and bottom-left; 45° cuts on top-left and bottom-right. */
const BADGE_SHAPE =
  'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)';

export const SquadSideBadge: FC<SquadSideBadgeProps> = ({ name, type, className, size = 'default' }) => {
  if (!name) return null;

  const color = MissionModel.resolveMissionSideColor(type ?? undefined);

  return (
    <span className={cn('relative inline-flex w-fit', color.badgeGlow, className)}>
      <span aria-hidden className={cn('absolute inset-0', color.badgeStroke)} style={{ clipPath: BADGE_SHAPE }} />
      <span aria-hidden className={cn('absolute inset-px', color.badgeFill)} style={{ clipPath: BADGE_SHAPE }} />
      <span
        className={cn(
          'relative z-10 inline-flex items-center font-bold uppercase tracking-wide',
          color.text,
          size === 'compact' ? 'px-2 py-px pr-3 text-[9px] leading-4' : 'px-2.5 py-0.5 pr-3.5 text-[10px] leading-4',
        )}>
        {name}
      </span>
    </span>
  );
};
