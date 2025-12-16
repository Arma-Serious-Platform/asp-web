import { ROUTES } from '@/shared/config/routes';
import { User } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Link } from '@/shared/ui/atoms/link';
import Image from 'next/image';
import { FC } from 'react';

export const UserSquad: FC<{
  user: User | null;
}> = ({ user }) => {
  if (!user) return null;

  const squad = user.squad;

  if (!squad)
    return (
      <div className='flex flex-col gap-2 justify-center'>
        Ви одинак.<br />Якщо бажаєте приєднатися до загону, оберіть загін зі списку
        та поспілкуйтеся з командиром.
        <Link href={ROUTES.squads} className='w-fit mx-auto'>
          <Button>Загони проекту</Button>
        </Link>
      </div>
    );

  return (
    <div className='flex flex-col gap-4 rounded-xl border border-white/10 bg-black/60 p-4 shadow-md'>
      <div className='flex gap-4'>
        <div className='overflow-hidden rounded-lg border border-white/10 bg-black/70'>
          <Image
            src={squad.logo?.url || '/images/logo.webp'}
            alt={squad.name}
            width={128}
            height={128}
            className='h-32 w-32 object-cover'
          />
        </div>

        <div className='flex flex-1 flex-col justify-between gap-2'>
          <div className='flex flex-col gap-1'>
            <span className='text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500'>
              Мій загін
            </span>
            <div className='text-xl font-semibold text-white'>{squad.name}</div>
            {squad.tag && (
              <div className='inline-flex w-fit items-center rounded-full border border-white/15 bg-black/60 px-3 py-0.5 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-200'>
                {squad.tag}
              </div>
            )}
          </div>

          <Link href={`${ROUTES.squads}/${squad.id}`} className='w-fit'>
            <Button size='sm' variant='secondary' className='text-xs uppercase tracking-[0.14em]'>
              До сторінки загону
            </Button>
          </Link>
        </div>
      </div>

      <div className='mt-2 flex flex-col gap-2'>
        <span className='text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500'>
          Склад загону
        </span>
        {Array.isArray(squad.members) && squad.members.length > 0 ? (
          <ul className='flex flex-wrap gap-2 text-xs text-zinc-200'>
            {squad.members.map((member) => (
              <li
                key={member.id}
                className='rounded-full bg-black/70 px-3 py-1'>
                {member.nickname ?? member.id}
                {member.id === user.id && (
                  <span className='ml-1 text-[10px] uppercase tracking-[0.16em] text-primary'>
                    (ви)
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <span className='text-xs text-zinc-400'>
            Інформація про учасників загону недоступна.
          </span>
        )}
      </div>
    </div>
  );
};
