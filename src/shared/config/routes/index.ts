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
    users: {
      id: (id: string) => `/users/${id}`,
    },
  },
  admin: {
    root: '/admin',
    users: '/admin/users',
    servers: '/admin/servers',
    sides: '/admin/sides',
    squads: '/admin/squads',
  },
} as const;
