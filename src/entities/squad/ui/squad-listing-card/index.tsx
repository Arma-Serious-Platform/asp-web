import { UserNicknameText } from '@/entities/user/ui/user-text';
import { ROUTES } from '@/shared/config/routes';
import { Squad } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { cn } from '@/shared/utils/cn';
import { UsersRoundIcon, UserStarIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

const SquadListingCard: FC<{
  squad: Squad | null;
  align?: 'left' | 'right';
}> = ({ squad, align = 'left' }) => {
  if (!squad) return null;

  return (
    <div
      className={cn('group relative w-full transition-all duration-200', {
        'items-start text-left': align === 'left',
        'items-end text-right': align === 'right',
      })}>
      <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/40 via-cyan-500/20 to-purple-500/40 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-60' />

      <div className='relative flex w-full flex-col items-stretch gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-black/50 p-3 shadow-lg shadow-black/40 backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-emerald-400/50 group-hover:bg-black/70 md:flex-row'>
        <div className='absolute right-2 top-2 flex items-center gap-1.5 rounded-full border border-neutral-700/80 bg-black/80 px-2.5 py-1 text-[11px] font-medium text-zinc-100 md:right-3 md:top-3'>
          <UsersRoundIcon className='size-3 text-zinc-400' />
          <span className='text-xs font-medium'>
            Гравців: {squad?._count?.members ?? 0}
          </span>
        </div>
        <div className='flex flex-col items-center gap-2 md:w-auto md:flex-shrink-0'>
          <div className='overflow-hidden rounded-xl border border-white/10 bg-black/60 shadow-md shadow-black/50'>
            <Image
              src={squad.logo?.url || '/images/avatar.jpg'}
              className='h-28 w-28 object-cover transition-transform duration-300 group-hover:scale-105 sm:h-32 sm:w-32'
              width={128}
              height={128}
              alt={squad.name}
            />
          </div>
          <div className='rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200 shadow-sm shadow-emerald-500/40'>
            {squad.tag}
          </div>
        </div>

        <div className='flex flex-1 flex-col justify-between gap-3 md:pt-0 pt-1'>
          <div className='flex flex-col gap-1.5'>
            <div className='inline-flex items-center gap-2'>
              <span className='rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400'>
                Загін
              </span>
              <span className='h-[1px] flex-1 bg-gradient-to-r from-white/40 via-white/10 to-transparent' />
            </div>
            <div className='text-xl font-semibold tracking-tight text-white'>
              {squad.name}
            </div>
          </div>

          <div className='flex items-center justify-between gap-4 text-sm text-zinc-300'>
            <div className='flex flex-col gap-1.5'>
              <div className='flex items-center gap-1.5'>
                <UserStarIcon className='size-4 text-amber-300 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]' />
                <span className='text-xs uppercase tracking-widest text-zinc-500'>
                  Командир
                </span>
              </div>
              <UserNicknameText
                className='max-w-[180px] truncate text-sm font-medium text-zinc-100 hover:text-emerald-300 hover:underline'
                user={{ ...squad.leader, squad: squad }}
              />
            </div>

            <div className='flex flex-col gap-2 items-end'>
              <Link
                href={`${ROUTES.squads}/${squad.id}`}
                className='block text-[11px] font-medium'>
                <Button
                  size='sm'
                  variant='secondary'
                  className='min-w-[150px] justify-center rounded-sm border border-neutral-600 bg-neutral-800/95 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-100 hover:bg-neutral-700 hover:border-neutral-400'>
                  Переглянути загін
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SquadListingCard };
