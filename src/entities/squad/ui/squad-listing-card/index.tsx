import { UserNicknameText } from '@/entities/user/ui/user-text';
import { Squad } from '@/shared/sdk/types';
import Image from 'next/image';
import { FC } from 'react';

const SquadListingCard: FC<{
  squad: Squad | null;
}> = ({ squad }) => {
  if (!squad) return null;

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-2'>
        <Image
          src={squad.logoUrl || '/images/avatar.jpg§'}
          alt={squad.name}
          width={32}
          height={32}
        />
        <div className='flex flex-col gap-2'>
          <div className='font-bold'>{squad.name}</div>
          <div className='text-sm'>
            <UserNicknameText user={{ ...squad.leader, squad: squad }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export { SquadListingCard };
