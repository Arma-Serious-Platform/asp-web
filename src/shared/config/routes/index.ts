export const ROUTES = {
  home: '/',
  rules: '/rules',
  schedule: '/schedule',
  squads: '/squads',
  replays: '/replays',
  auth: {
    login: '/auth/login',
    signup: '/auth/sign-up',
  },
  user: {
    profile: '/profile',
  },
  admin: {
    dashboard: '/admin/dashboard',
  },
} as const;
