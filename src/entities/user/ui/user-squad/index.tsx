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
        Ви одинак. Якщо бажаєте приєднатися до конкретного загону, оберіть загін
        зі списку та поспілкуйтеся з командиром.
        <Link href={ROUTES.squads} className='w-fit mx-auto'>
          <Button>Загони проекту</Button>
        </Link>
      </div>
    );

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-2'>
        <Image
          src='/images/squad.png'
          alt={squad.name}
          width={32}
          height={32}
        />
      </div>
    </div>
  );
};
