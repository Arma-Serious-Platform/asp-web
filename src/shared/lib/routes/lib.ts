export const AUTH_REDIRECT_SKIP_PATHS = [
  '/auth/session/login',
  '/auth/session/logout',
  '/auth/session/me',
  '/users/signup',
  '/users/sign-up/confirm',
  '/users/forgot-password',
  '/users/change-password',
] as const;
