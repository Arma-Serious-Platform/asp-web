'use server';

import { cookies } from 'next/headers';

export const setTokens = async ({
  token,
  refreshToken,
}: {
  token: string;
  refreshToken: string;
}) => {
  const cookieStore = await cookies();
  cookieStore.set('token', token);
  cookieStore.set('refreshToken', refreshToken);
};
