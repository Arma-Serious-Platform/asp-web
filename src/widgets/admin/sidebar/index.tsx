import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/atoms/button';
import classNames from 'classnames';
import Link from 'next/link';
import { FC } from 'react';

const AdminSidebar: FC<{ className?: string }> = ({ className }) => (
  <aside
    className={classNames(
      'flex flex-col gap-2 bg-card max-w-40 w-full',
      className
    )}>
    <div className='flex gap-0.5 w-full'>
      <Link href={ROUTES.admin.users} className='w-full'>
        <Button className='w-full' size='sm' align='left'>
          Гравці
        </Button>
      </Link>
      <Link href={ROUTES.admin.squads} className='w-full'>
        <Button className='w-full' size='sm' align='left'>
          Загони
        </Button>
      </Link>
      <Link href={ROUTES.admin.sides} className='w-full'>
        <Button className='w-full' size='sm' align='left'>
          Сторони
        </Button>
      </Link>
      <Link href={ROUTES.admin.servers} className='w-full'>
        <Button className='w-full' size='sm' align='left'>
          Сервери
        </Button>
      </Link>
    </div>
  </aside>
);

export { AdminSidebar };
