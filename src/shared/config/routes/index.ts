export const ROUTES = {
  home: '/',
  rules: '/rules',
  schedule: '/schedule',
  races: '/races',
  replays: '/replays',
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
  },
  user: {
    profile: '/profile',
  },
  admin: {
    dashboard: '/admin/dashboard',
  },
} as const;
