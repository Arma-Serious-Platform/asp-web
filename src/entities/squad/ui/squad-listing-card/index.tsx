import { UserNicknameText } from '@/entities/user/ui/user-text';
import { ROUTES } from '@/shared/config/routes';
import { Squad } from '@/shared/sdk/types';
import { cn } from '@/shared/utils/cn';
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
        'flex flex-col gap-2 paper p-2 size-fit hover:bg-black/50 cursor-pointer hover:scale-110 transition-all duration-150',
        {
          'items-start': align === 'left',
          'items-end': align === 'right',
        }
      )}>
      <div className='flex items-center gap-2'>
        <div className='flex flex-col gap-1'>
          <Image
            className='size-auto'
            src={squad.logo?.url || '/images/avatar.jpg'}
            width={40}
            height={40}
            alt={squad.name}
          />
        </div>
        <div className='flex flex-col gap-1 mb-auto'>
          <div className='font-bold'>{squad.name}</div>
          <div className='text-sm'>
            <UserNicknameText
              className='hover:underline cursor-pointer'
              user={{ ...squad.leader, squad: squad }}
            />
          </div>
        </div>
        <div className='flex flex-col gap-1 text-xs'>
          <div>
            Учасників: <span>{squad?._count?.members}</span>
          </div>
          <div>
            <span className='text-green-500'>Активних:</span>{' '}
            <span>{squad.activeCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SquadListingCard };
