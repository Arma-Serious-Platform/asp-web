'use client';

import { session } from '@/entities/session/model';
import { ROUTES } from '@/shared/config/routes';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const getFirstAllowedAdminRoute = () => {
  if (session.canManageUsers) return ROUTES.admin.users;
  if (session.canManageWeekends) return ROUTES.admin.weekends;
  if (session.canManageIslands) return ROUTES.admin.islands;
  if (session.canManageServers) return ROUTES.admin.servers;
  if (session.canManageSquadsAndSides) return ROUTES.admin.squads;
  if (session.canManageRules) return ROUTES.admin.rules;

  return ROUTES.home;
};

export function useAdminRouteGuard(canAccess: boolean) {
  const router = useRouter();

  useEffect(() => {
    if (!session.isAuthorized) return;

    if (!canAccess) {
      router.replace(getFirstAllowedAdminRoute());
    }
  }, [canAccess, router, session.isAuthorized, session.user?.user?.role]);
}
