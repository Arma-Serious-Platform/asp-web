import { api } from '@/shared/sdk';
import { cache } from 'react';

export const getCachedUser = cache(async () => {
  try {
    const { data: user } = await api.getMe();

    return user;
  } catch {
    return null;
  }
});
