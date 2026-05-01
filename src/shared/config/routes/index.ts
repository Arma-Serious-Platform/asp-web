export const ROUTES = {
  home: '/',
  headquarters: '/headquarters',
  hq: {
    root: '/hq',
    plans: '/hq/plans',
    planById: (id: string) => `/hq/plans/${id}`,
  },
  rules: '/rules',
  weekends: '/weekends',
  squads: '/squads',
  replays: '/replays',
  missions: {
    root: '/missions',
    create: '/mission/create',
    id: (id: string) => `/missions/${id}`,
  },
  auth: {
    login: '/auth/login',
    signup: '/auth/sign-up',
    forgotPassword: '/auth/forgot-password',
    forgotPasswordConfirm: (token: string) => `/auth/forgot-password/confirm?token=${token}`,
  },
  user: {
    profile: '/profile',
    profileById: (id: string) => `/profile/${id}`,
  },
  admin: {
    root: '/admin',
    users: '/admin/users',
    servers: '/admin/servers',
    sides: '/admin/sides',
    squads: '/admin/squads',
    weekends: '/admin/weekends',
  },
} as const;
