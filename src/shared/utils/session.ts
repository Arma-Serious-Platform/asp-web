'use client';

import { ROUTES } from '@/shared/config/routes';

export const redirectToLogin = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const loginPath = ROUTES.auth.login;

  if (window.location.pathname === loginPath) {
    return;
  }

  window.location.href = loginPath;
};
