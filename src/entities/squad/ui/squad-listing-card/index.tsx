import { UserNicknameText } from '@/entities/user/ui/user-text';
import { ROUTES } from '@/shared/config/routes';
import { Squad } from '@/shared/sdk/types';
import { cn } from '@/shared/utils/cn';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

const SquadListingCard: FC<{
  squad: Squad | null;
  align?: 'left' | 'right'
}> = ({ squad, align = 'left' }) => {
  if (!squad) return null;

  return (
    <div className={cn('flex flex-col gap-2', {
      'items-start': align === 'left',
      'items-end': align === 'right',
    })}>
      <div className='flex items-center gap-2'>
        <Image
          src={squad.logoUrl || '/images/avatar.jpg'}
          alt={squad.name}
          width={40}
          height={40}
        />
        <div className='flex flex-col gap-1'>
          <div className='font-bold'>{squad.name}</div>
          <div className='text-sm'>
            <Link href={ROUTES.user.users.id(squad.leader?.id || '')}>
              <UserNicknameText
                className='hover:underline cursor-pointer'
                user={{ ...squad.leader, squad: squad }}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SquadListingCard };
