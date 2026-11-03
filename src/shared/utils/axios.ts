import { isAxiosError } from 'axios';

export const isBadRequest = (error: unknown, message = '') => {
  return (
    isAxiosError(error) &&
    error.response?.status === 400 &&
    (message ? error.response?.data?.message === message : true)
  );
};
