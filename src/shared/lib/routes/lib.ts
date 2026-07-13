export const AUTH_REDIRECT_SKIP_PATHS = [
  '/auth/session/login',
  '/auth/session/logout',
  '/auth/session/me',
  '/auth/session/verify-2fa',
  '/auth/2fa/setup',
  '/auth/2fa/enable',
  '/auth/2fa/disable',
  '/users/signup',
  '/users/sign-up/confirm',
  '/users/forgot-password',
  '/users/change-password',
] as const;
