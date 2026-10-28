import type { SsoScope } from '@/shared/sdk/sso/sso.api';

/** How each scope is described to the user. */
export const SSO_SCOPES: Record<SsoScope, { title: string; hint?: string; short: string }> = {
  profile: { title: 'Нікнейм і аватар', short: 'Профіль' },
  email: { title: 'Email-адресу', short: 'Email' },
  roles: { title: 'Ролі на платформі', hint: 'завжди актуальні', short: 'Ролі' },
  squad: { title: 'Загін і роль у загоні', short: 'Загін' },
  game: { title: 'Steam ID і статус доступу до ігрового сервера', short: 'Steam' },
  offline_access: {
    title: 'Залишатися в системі',
    hint: 'до 30 днів без повторного входу',
    short: 'Залишатися в системі',
  },
};

const SCOPE_ORDER: SsoScope[] = ['profile', 'email', 'roles', 'squad', 'game', 'offline_access'];

export const sortScopes = (scopes: SsoScope[]) => SCOPE_ORDER.filter(scope => scopes.includes(scope));
