'use client';

import { session } from '@/entities/session/model';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/atoms/button';
import classNames from 'classnames';
import { CalendarIcon, MapPin, MedalIcon, ScrollTextIcon, ServerIcon, SwordIcon, UserIcon, UsersIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, ReactNode } from 'react';

const AdminSidebarItem: FC<{
  href: string;
  label: string;
  icon: ReactNode;
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
        {session.canManageUsers && <AdminSidebarItem href={ROUTES.admin.users} label="Гравці" icon={<UserIcon />} />}

        {session.canManageSquadsAndSides && (
          <AdminSidebarItem href={ROUTES.admin.squads} label="Загони" icon={<UsersIcon />} />
        )}

        {session.canManageSquadsAndSides && (
          <AdminSidebarItem href={ROUTES.admin.sides} label="Сторони" icon={<SwordIcon />} />
        )}

        {session.canManageServers && (
          <AdminSidebarItem href={ROUTES.admin.servers} label="Сервери" icon={<ServerIcon />} />
        )}

        {session.canManageIslands && <AdminSidebarItem href={ROUTES.admin.islands} label="Острови" icon={<MapPin />} />}

        {session.canManageWeekends && (
          <AdminSidebarItem href={ROUTES.admin.weekends} label="Анонси" icon={<CalendarIcon />} />
        )}

        {session.canManageRules && (
          <AdminSidebarItem href={ROUTES.admin.rules} label="Правила" icon={<ScrollTextIcon />} />
        )}

        {session.canManageSpecializations && (
          <AdminSidebarItem href={ROUTES.admin.specializations} label="Спеціалізації" icon={<MedalIcon />} />
        )}
      </div>
    </aside>
  );
});

export { AdminSidebar };
