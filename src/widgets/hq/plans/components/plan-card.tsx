'use client';

import { HeadquartersGamePlan, Game, SideType } from '@/shared/sdk/types';
import { cn } from '@/shared/utils/cn';
import { UserNicknameText } from '@/entities/user/ui/user-text';
import { CalendarIcon, UserIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { getGameHumanLabel } from '../lib';

type PlanCardProps = {
  plan: HeadquartersGamePlan;
  activePlanId?: string;
  game?: Game;
  commander?: HeadquartersGamePlan['gameCommander'];
};

export function PlanCard({ plan, activePlanId, game, commander }: PlanCardProps) {
  const missionName = plan.game?.mission?.name ?? game?.mission?.name ?? `Гра #${plan.game?.position ?? '-'}`;
  const dateLabel = getGameHumanLabel(plan.game?.date, plan.game?.position);
  const hqSideType = plan.hqSquad
    ? plan.side?.type ?? commander?.squad?.side?.type
    : undefined;

  return (
    <Link href={`/hq/plans/${plan.id}`} className="block w-full">
      <div
        className={cn(
          'flex gap-2.5 rounded-md border border-transparent bg-black/30 px-2 py-2 transition-colors',
          activePlanId === plan.id ? 'border-primary/40 bg-primary/15' : 'hover:bg-white/5',
        )}>
        <div className="relative size-12 shrink-0 overflow-hidden rounded border border-white/10">
          <Image
            src={game?.mission?.image?.url || '/images/avatar.jpg'}
            alt={missionName}
            fill
            className="object-cover"
            unoptimized={!game?.mission?.image?.url?.startsWith('https')}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-zinc-100">{missionName}</div>
          <div className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-zinc-400">
            <CalendarIcon className="size-3.5 shrink-0" />
            <span className="truncate">{dateLabel}</span>
          </div>

          <div className="mt-1 flex min-w-0 items-center gap-1 text-[11px] text-zinc-500">
            <UserIcon className="size-3 shrink-0" />
            {commander ? (
              <span className="min-w-0 truncate text-zinc-400">
                <UserNicknameText link={false} user={commander} />
              </span>
            ) : (
              <span>КС відсутній</span>
            )}
            {plan.hqSquad && (
              <span
                className={cn('shrink-0 font-medium', {
                  'text-blue-500': hqSideType === SideType.BLUE,
                  'text-red-500': hqSideType === SideType.RED,
                  'text-zinc-500': !hqSideType || hqSideType === SideType.UNASSIGNED,
                })}>
                · [{plan.hqSquad.tag}]
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
