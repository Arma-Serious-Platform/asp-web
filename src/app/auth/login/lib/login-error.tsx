import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';

const LOGIN_ERROR_MESSAGES = {
  permanentBan: 'Вас забанено назавжди',
  invalidCredentials: 'Invalid credentials',
  confirmEmail: 'Please confirm your email before logging in',
  activationResent: 'Activation token expired. New token sent to your email',
} as const;

/** `failed`: no response at all (network failure or a bug). */
export type LoginErrorKind =
  | 'failed'
  | 'permanentBan'
  | 'invalidCredentials'
  | 'confirmEmail'
  | 'activationResent'
  | 'other';

export const getLoginErrorKind = (error: unknown): LoginErrorKind => {
  if (!isAxiosError(error)) {
    return 'failed';
  }

  const message = error.response?.data?.message;

  if (message === LOGIN_ERROR_MESSAGES.permanentBan) return 'permanentBan';
  if (message === LOGIN_ERROR_MESSAGES.confirmEmail) return 'confirmEmail';
  if (message === LOGIN_ERROR_MESSAGES.activationResent) return 'activationResent';
  if (message === LOGIN_ERROR_MESSAGES.invalidCredentials || error.response?.status === 401) {
    return 'invalidCredentials';
  }

  return 'other';
};

export const showActivationToast = (kind: 'confirmEmail' | 'activationResent') => {
  if (kind === 'confirmEmail') {
    toast.error(
      <div className="text-left">
        Аккаунт ще не активовано.
        <br />
        <br />
        На пошту надіслано посилання для активації. У вас є 10 хвилин для активації аккаунту. <br />
        <br />
        Якщо ви не активуєте аккаунт за цей час, вам необхідно буде спробувати авторизуватися заново для відправки
        нового листа.
      </div>,
      {
        duration: 15000,
      },
    );
    return;
  }

  toast.error(
    <div className="text-left">
      Попереднє посилання для активації вже не дійсне.
      <br />
      <br />
      Ми надіслали новий лист для підтвердження на вашу електронну пошту. У вас є 10 хвилин для активації аккаунту.
    </div>,
    {
      duration: 15000,
    },
  );
};
