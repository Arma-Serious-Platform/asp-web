export const ROUTES = {
  home: '/',
  headquarters: '/headquarters',
  rules: '/rules',
  schedule: '/schedule',
  squads: '/squads',
  replays: '/replays',
  auth: {
    login: '/auth/login',
    signup: '/auth/sign-up',
    forgotPassword: '/auth/forgot-password',
    forgotPasswordConfirm: (token: string) =>
      `/auth/forgot-password/confirm?token=${token}`,
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
