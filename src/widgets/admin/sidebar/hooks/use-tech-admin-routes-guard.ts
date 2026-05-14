'use client';

import { session } from '@/entities/session/model';
import { ROUTES } from '@/shared/config/routes';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Redirects to `/admin/users` if the current user is not OWNER or TECH_ADMIN. */
export function useTechAdminRoutesGuard() {
  const router = useRouter();

  useEffect(() => {
    if (session.isAuthorized && !session.hasTechAdminAccess) {
      router.replace(ROUTES.admin.users);
    }
  }, [session.isAuthorized, session.user?.user?.role, router]);
}
