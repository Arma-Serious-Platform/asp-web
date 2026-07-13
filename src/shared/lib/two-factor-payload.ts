import { isAxiosError } from 'axios';

export function buildTwoFactorCodePayload(code?: string, recoveryCode?: string) {
  const normalizedRecoveryCode = recoveryCode?.trim();
  if (normalizedRecoveryCode) {
    return { recoveryCode: normalizedRecoveryCode };
  }

  const normalizedCode = code?.trim();
  if (normalizedCode) {
    return { code: normalizedCode };
  }

  return {};
}

export function getDisableTwoFactorFieldErrors(error: unknown) {
  if (!isAxiosError(error)) {
    return {};
  }

  const status = error.response?.status;
  const message = error.response?.data?.message;
  const normalizedMessage = Array.isArray(message) ? message.join(' ') : message;

  if (
    normalizedMessage === 'Invalid password' ||
    (status === 400 &&
      typeof normalizedMessage === 'string' &&
      normalizedMessage.toLowerCase().includes('password'))
  ) {
    return { password: 'Невірний пароль' };
  }

  if (normalizedMessage === 'Invalid authentication code') {
    return { code: 'Невірний код автентифікації' };
  }

  return {};
}
