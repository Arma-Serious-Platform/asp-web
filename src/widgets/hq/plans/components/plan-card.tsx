'use client';

import { HeadquartersGamePlan, Game, Side, User } from '@/shared/sdk/types';
import { cn } from '@/shared/utils/cn';
import { UserNicknameText } from '@/entities/user/ui/user-text';
import { ShieldIcon, UserIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { getGameHumanLabel, sideAppearance } from '../lib';
import { PlanCardSideName } from './plan-card-side-name';

type PlanCardProps = {
  plan: HeadquartersGamePlan;
  activePlanId?: string;
  game?: Game;
  attackSideType?: Side['type'];
  defenseSideType?: Side['type'];
  attackSideName?: string;
  defenseSideName?: string;
  commander?: User | null;
};

export function PlanCard({
  plan,
  activePlanId,
  game,
  attackSideType,
  defenseSideType,
  attackSideName,
  defenseSideName,
  commander,
}: PlanCardProps) {
  const attackAppearance = sideAppearance(attackSideType);
  const defenseAppearance = sideAppearance(defenseSideType);

  return (
    <Link href={`/hq/plans/${plan.id}`} className="block w-[300px] shrink-0">
      <div
        className={cn(
          'rounded-md border border-transparent bg-black/30 px-2 py-2 transition-colors',
          activePlanId === plan.id ? 'border-primary/40 bg-primary/15' : 'hover:bg-white/5',
        )}>
        <div className="relative mb-1.5 aspect-video w-full overflow-hidden rounded-md border border-white/10">
          <Image
            src={game?.mission?.image?.url || '/images/avatar.jpg'}
            alt={game?.mission?.name || 'mission image'}
            fill
            className="object-cover"
            unoptimized={!game?.mission?.image?.url?.startsWith('https')}
          />
        </div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold text-zinc-100">
              {plan.game?.mission?.name ?? `Гра #${plan.game?.position ?? '-'}`}
            </div>
            <div className="mt-1 flex items-start gap-1 text-xs font-semibold text-zinc-300">
              <ShieldIcon className="mt-0.5 size-3.5 shrink-0" />
              <span className="min-w-0 wrap-break-word leading-snug">
                {getGameHumanLabel(plan.game?.date, plan.game?.position)}
              </span>
            </div>
          </div>
          <div className="shrink-0 text-right text-xs">
            <div className="flex items-center justify-end gap-1 text-zinc-400">
              <UserIcon className="size-3.5" />
              {commander ? (
                <span className="text-zinc-300">
                  <UserNicknameText link={false} user={commander} />
                </span>
              ) : (
                <span className="text-zinc-500">КС відсутній</span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-1 flex min-w-0 items-center gap-2 text-[11px]">
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <span className={cn('size-2 shrink-0 rounded-full', attackAppearance.dot)} />
            <PlanCardSideName
              className={attackAppearance.text}
              name={game?.missionVersion?.attackSideName ?? attackSideName ?? '—'}
              slots={game?.missionVersion?.attackSideSlots}
            />
            <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold', attackAppearance.badge)}>
              Атака
            </span>
          </div>
          <span className="shrink-0 text-zinc-500">vs</span>
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <span className={cn('size-2 shrink-0 rounded-full', defenseAppearance.dot)} />
            <PlanCardSideName
              className={defenseAppearance.text}
              name={game?.missionVersion?.defenseSideName ?? defenseSideName ?? '—'}
              slots={game?.missionVersion?.defenseSideSlots}
            />
            <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold', defenseAppearance.badge)}>
              Оборона
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
