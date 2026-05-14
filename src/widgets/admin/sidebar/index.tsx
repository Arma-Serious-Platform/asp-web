'use client';

import { session } from '@/entities/session/model';
import { ROUTES } from '@/shared/config/routes';
import { UserRole } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import classNames from 'classnames';
import { CalendarIcon, MapPin, ServerIcon, SwordIcon, UserIcon, UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';
import { observer } from 'mobx-react-lite';

const AdminSidebarItem: FC<{
  href: string;
  label: string;
  icon: React.ReactNode;
}> = ({ href, label, icon }) => {
  const pathname = usePathname();

  return (
    <Link href={href} className="w-full">
      <Button className="w-full" size="sm" align="left" variant={pathname === href ? 'outline' : 'default'}>
        {icon}
        {label}
      </Button>
    </Link>
  );
};

const AdminSidebar: FC<{ className?: string }> = observer(({ className }) => {
  return (
    <aside className={classNames('flex flex-col gap-2 bg-card max-w-40 w-full', className)}>
      <div className="flex w-full gap-0.5">
        <AdminSidebarItem href={ROUTES.admin.users} label="Гравці" icon={<UserIcon />} />
        <AdminSidebarItem href={ROUTES.admin.squads} label="Загони" icon={<UsersIcon />} />
        <AdminSidebarItem href={ROUTES.admin.sides} label="Сторони" icon={<SwordIcon />} />
        <AdminSidebarItem href={ROUTES.admin.servers} label="Сервери" icon={<ServerIcon />} />
        {session?.hasTechAdminAccess && (
          <AdminSidebarItem href={ROUTES.admin.islands} label="Острови" icon={<MapPin />} />
        )}
        <AdminSidebarItem href={ROUTES.admin.weekends} label="Анонси" icon={<CalendarIcon />} />
      </div>
    </aside>
  );
});

export { AdminSidebar };
