'use client';

const LOCAL_STORAGE_KEYS = {
  token: 'token',
  refreshToken: 'refreshToken',
};

export const clearTokensFromLocalStorage = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.token);
  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.refreshToken);
};

export const getTokensFromLocalStorage = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const token = window.localStorage.getItem(LOCAL_STORAGE_KEYS.token);
  const refreshToken = window.localStorage.getItem(LOCAL_STORAGE_KEYS.refreshToken);

  return { token, refreshToken };
};

export const setTokensToLocalStorage = (token: string, refreshToken: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(LOCAL_STORAGE_KEYS.token, token);
  window.localStorage.setItem(LOCAL_STORAGE_KEYS.refreshToken, refreshToken);
};

export const checkIsAuthenticated = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const { token, refreshToken } = getTokensFromLocalStorage();

  return token && refreshToken;
};

export const redirectToLogin = () => {
  window.location.href = `/`;
};
