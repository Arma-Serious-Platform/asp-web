'use client';

import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/atoms/button';
import classNames from 'classnames';
import { ServerIcon, SwordIcon, UserIcon, UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

const AdminSidebarItem: FC<{
  href: string;
  label: string;
  icon: React.ReactNode;
}> = ({ href, label, icon }) => {
  const pathname = usePathname();

  return (
    <Link href={href} className='w-full'>
      <Button
        className='w-full'
        size='sm'
        align='left'
        variant={pathname === href ? 'outline' : 'default'}>
        {icon}
        {label}
      </Button>
    </Link>
  );
};

const AdminSidebar: FC<{ className?: string }> = ({ className }) => {
  return (
    <aside
      className={classNames(
        'flex flex-col gap-2 bg-card max-w-40 w-full',
        className
      )}>
      <div className='flex gap-0.5 w-full'>
        <AdminSidebarItem
          href={ROUTES.admin.users}
          label='Гравці'
          icon={<UserIcon />}
        />
        <AdminSidebarItem
          href={ROUTES.admin.squads}
          label='Загони'
          icon={<UsersIcon />}
        />
        <AdminSidebarItem
          href={ROUTES.admin.sides}
          label='Сторони'
          icon={<SwordIcon />}
        />
        <AdminSidebarItem
          href={ROUTES.admin.servers}
          label='Сервери'
          icon={<ServerIcon />}
        />
      </div>
    </aside>
  );
};

export { AdminSidebar };
