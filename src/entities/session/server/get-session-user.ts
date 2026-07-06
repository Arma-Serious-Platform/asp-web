import { headers } from 'next/headers';

import { env } from '@/shared/config/env';
import type { User } from '@/shared/sdk/types';

export async function getSessionUser(): Promise<User | null> {
  if (!env.apiUrl) {
    return null;
  }

  const cookieHeader = (await headers()).get('cookie');

  if (!cookieHeader) {
    return null;
  }

  try {
    const response = await fetch(`${env.apiUrl}/auth/session/me`, {
      headers: {
        cookie: cookieHeader,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as User;
  } catch {
    return null;
  }
}
