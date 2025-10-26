import { api } from '@/shared/sdk';

export const getUser = async () => {
  try {
    const { data: user } = await api.getMe();

    return user;
  } catch {
    return null;
  }
};
