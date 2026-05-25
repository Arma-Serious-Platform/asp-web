import { FC } from 'react';
import Image from 'next/image';

import { Specialization } from '@/shared/sdk/types';
import { cn } from '@/shared/utils/cn';
import { Tooltip } from '@/shared/ui/moleculas/tooltip';

type SpecializationBadgesProps = {
  specializations?: Specialization[] | null;
  className?: string;
  compact?: boolean;
  visibleCount?: number;
};

const resolveSpecializationColor = (color?: string | null) => color || '#84cc16';

const SpecializationBadge: FC<{ specialization: Specialization; compact?: boolean }> = ({
  specialization,
  compact,
}) => {
  const color = resolveSpecializationColor(specialization.color);
  const iconUrl = specialization.icon?.url;

  return (
    <span
      title={specialization.name}
      className={cn(
        'inline-flex max-w-full items-center gap-1 rounded-full border bg-black/45 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-100',
        compact && 'px-1 py-0',
      )}
      style={{ borderColor: color, color }}>
      {iconUrl ? (
        <Image
          src={iconUrl}
          alt=""
          width={14}
          height={14}
          className="size-3.5 rounded-full object-cover"
          unoptimized={!iconUrl.startsWith('https')}
        />
      ) : (
        <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      )}
      <span className="truncate">{specialization.name}</span>
    </span>
  );
};

export const SpecializationBadges: FC<SpecializationBadgesProps> = ({
  specializations,
  className,
  compact = false,
  visibleCount = 3,
}) => {
  if (!specializations?.length) return null;

  const resolvedVisibleCount =
    typeof visibleCount === 'number'
      ? Math.max(0, Math.min(visibleCount, specializations.length))
      : specializations.length;
  const visibleSpecializations = specializations.slice(0, resolvedVisibleCount);
  const hiddenSpecializations = specializations.slice(resolvedVisibleCount);

  return (
    <div className={cn('flex min-w-0 flex-wrap items-center gap-1', className)}>
      {visibleSpecializations.map(specialization => (
        <SpecializationBadge key={specialization.id} specialization={specialization} compact={compact} />
      ))}
      {hiddenSpecializations.length > 0 && (
        <Tooltip
          trigger={
            <span
              className={cn(
                'inline-flex items-center rounded-full border border-white/10 bg-black/45 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-300',
                compact && 'px-1 py-0',
              )}
              aria-label={`Приховано спеціалізацій: ${hiddenSpecializations.length}`}>
              (+{hiddenSpecializations.length})
            </span>
          }>
          <div className="flex max-w-64 flex-wrap gap-1">
            {hiddenSpecializations.map(specialization => (
              <SpecializationBadge key={specialization.id} specialization={specialization} compact={compact} />
            ))}
          </div>
        </Tooltip>
      )}
    </div>
  );
};

export const SpecializationOptionContent: FC<{ specialization: Specialization }> = ({ specialization }) => {
  const color = resolveSpecializationColor(specialization.color);
  const iconUrl = specialization.icon?.url;

  return (
    <span className="flex min-w-0 items-center gap-2">
      {iconUrl ? (
        <Image
          src={iconUrl}
          alt=""
          width={18}
          height={18}
          className="size-4 rounded-full object-cover"
          unoptimized={!iconUrl.startsWith('https')}
        />
      ) : (
        <span className="size-2 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      )}
      <span className="truncate">{specialization.name}</span>
    </span>
  );
};
