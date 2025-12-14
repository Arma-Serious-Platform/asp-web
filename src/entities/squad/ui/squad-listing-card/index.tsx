import { UserNicknameText } from '@/entities/user/ui/user-text';
import { ROUTES } from '@/shared/config/routes';
import { Squad } from '@/shared/sdk/types';
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
      className={cn(
        'flex flex-col gap-2 paper p-2 w-full hover:bg-black/50 cursor-pointer hover:scale-105 transition-all duration-150',
        {
          'items-start': align === 'left',
          'items-end': align === 'right',
        }
      )}>
      <div className='flex items-center gap-2 w-80'>
        <div className='flex flex-col gap-1'>
          <Image
            src={squad.logo?.url || '/images/avatar.jpg'}
            className='size-32 object-cover'
            width={128}
            height={128}
            alt={squad.name}
          />
          <div className='font-bold text-lg text-center'>{squad.tag}</div>
        </div>
        <div className='flex flex-col gap-1'>
          <div className='font-bold text-lg'>{squad.name}</div>
          <div className='flex items-center gap-1'>
            <UserStarIcon className='size-4' />
            <UserNicknameText
              className='hover:underline cursor-pointer'
              user={{ ...squad.leader, squad: squad }}
            />
          </div>

          <div className='flex flex-col gap-1 text-sm'>
            <div className='flex gap-1'>
              <UsersRoundIcon className='size-4' />
              <span>{squad?._count?.members}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SquadListingCard };
