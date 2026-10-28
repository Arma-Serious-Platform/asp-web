'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { ChevronLeftIcon, InfoIcon, LoaderIcon, LockIcon, ShieldCheckIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { getLoginErrorKind, showActivationToast } from '@/app/auth/login/lib/login-error';
import { AppTile } from '@/entities/sso/ui/app-tile';
import { ROUTES } from '@/shared/config/routes';
import type { SsoClient } from '@/shared/sdk/sso/sso.api';
import { OauthState } from '../state/oauth.state';
import { AppAndVtgTiles, OauthButton, OauthCard } from './oauth-shell';

const inputClassName =
  'h-11 w-full rounded-md border border-neutral-700 bg-black/70 px-3 text-[15px] text-zinc-100 placeholder:text-zinc-500 focus-visible:border-lime-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/40';

const credentialsSchema = z.object({
  login: z.string().trim().min(1, "Обов'язкове поле"),
  password: z.string().min(1, "Обов'язкове поле"),
});

type Credentials = z.infer<typeof credentialsSchema>;

const FieldError: FC<{ message?: string }> = ({ message }) =>
  message ? <p className="text-sm text-red-300">{message}</p> : null;

const Credentials: FC<{ model: OauthState; client: SsoClient }> = observer(({ model, client }) => {
  // Validated on submit: the autofocused field would otherwise show its error
  // as soon as focus moves, before anything was typed.
  const form = useForm<Credentials>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { login: '', password: '' },
    resolver: zodResolver(credentialsSchema),
  });
  const { errors, isSubmitting } = form.formState;
  const switchingFrom = model.isSwitchingAccount ? model.interaction?.user?.nickname : undefined;

  const onSubmit = async ({ login, password }: Credentials) => {
    try {
      const user = await model.login.login({ email: login, password });
      if (user) {
        await model.refresh();
      }
    } catch (error) {
      const kind = getLoginErrorKind(error);

      if (kind === 'permanentBan') {
        model.showBlocked();
      } else if (kind === 'invalidCredentials') {
        form.setError('password', { message: 'Неправильний email або пароль' });
      } else if (kind === 'confirmEmail' || kind === 'activationResent') {
        showActivationToast(kind);
      } else {
        toast.error('Не вдалося увійти. Спробуйте ще раз.');
      }
    }
  };

  return (
    <OauthCard>
      <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <AppAndVtgTiles client={client} />

        <div className="flex flex-col gap-1.5 text-center">
          <h1 className="text-[26px] font-bold">{switchingFrom ? 'Увійдіть іншим акаунтом' : 'Увійдіть через VTG'}</h1>
          <p className="text-[15px] text-zinc-400">
            щоб продовжити в <span className="font-semibold text-white">{client.name}</span>
            {client.domain && <> · {client.domain}</>}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="oauth-login" className="text-sm text-zinc-300">
            Email або нікнейм
          </label>
          <input
            id="oauth-login"
            autoFocus
            autoComplete="username"
            placeholder="name@example.com"
            className={inputClassName}
            aria-invalid={Boolean(errors.login)}
            {...form.register('login')}
          />
          <FieldError message={errors.login?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <label htmlFor="oauth-password" className="text-sm text-zinc-300">
              Пароль
            </label>
            <Link href={ROUTES.auth.forgotPassword} target="_blank" className="text-sm text-lime-400">
              Забули пароль?
            </Link>
          </div>
          <input
            id="oauth-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={inputClassName}
            aria-invalid={Boolean(errors.password)}
            {...form.register('password')}
          />
          <FieldError message={errors.password?.message} />
        </div>

        <OauthButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoaderIcon className="size-4 animate-spin" /> : 'Увійти'}
        </OauthButton>

        {switchingFrom ? (
          <>
            <div className="flex items-start gap-2.5 rounded-lg border border-white/8 bg-white/4 p-3">
              <InfoIcon aria-hidden className="mt-px size-4.5 shrink-0 text-lime-400" />
              <p className="text-[13px] leading-snug text-zinc-400">
                Поки ви не ввійдете, ви лишаєтеся в акаунті <span className="text-zinc-200">{switchingFrom}</span>.
                Після входу іншим акаунтом сеанс {switchingFrom} у цьому браузері завершиться.
              </p>
            </div>

            <button
              type="button"
              onClick={model.cancelSwitch}
              className="flex min-h-11 cursor-pointer items-center justify-center gap-1.5 text-sm text-lime-400 hover:text-lime-300">
              <ChevronLeftIcon aria-hidden className="size-4" />
              Назад до {switchingFrom}
            </button>
          </>
        ) : (
          <>
            <div className="flex items-start gap-2.5 rounded-lg border border-white/8 bg-white/4 p-3">
              <LockIcon aria-hidden className="mt-px size-4.5 shrink-0 text-lime-400" />
              <p className="text-[13px] leading-snug text-zinc-400">
                Ви вводите пароль на{' '}
                <span className="text-zinc-200">{typeof window === 'undefined' ? 'VTG' : window.location.host}</span>.{' '}
                {client.name} не побачить ваш пароль.
              </p>
            </div>

            <p className="text-center text-sm text-zinc-400">
              Немає акаунту?{' '}
              <Link href={ROUTES.auth.signup} target="_blank" className="text-lime-400">
                Зареєструватися
              </Link>
            </p>
          </>
        )}
      </form>
    </OauthCard>
  );
});

const TwoFactor: FC<{ model: OauthState; client: SsoClient }> = observer(({ model, client }) => {
  const [code, setCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const canSubmit = useRecoveryCode ? recoveryCode.trim().length > 0 : code.length === 6;

  const onSubmit = async () => {
    setIsVerifying(true);

    try {
      await model.login.verifyTwoFactor(
        useRecoveryCode ? undefined : code,
        useRecoveryCode ? recoveryCode.trim() : undefined,
      );
      await model.refresh();
    } catch (error) {
      toast.error(isAxiosError(error) ? 'Невірний код автентифікації' : 'Не вдалося підтвердити вхід');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <OauthCard>
      <form
        className="flex flex-col gap-5"
        onSubmit={event => {
          event.preventDefault();
          if (canSubmit) void onSubmit();
        }}>
        <div className="flex items-center gap-2.5 rounded-lg border border-white/8 bg-white/4 px-3 py-2">
          <AppTile name={client.name} vtg={client.firstParty} size="sm" />
          <span className="text-sm text-zinc-400">
            Вхід у <span className="font-semibold text-white">{client.name}</span> через VTG
          </span>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-full border border-lime-700 bg-lime-700/25">
            <ShieldCheckIcon aria-hidden className="size-5.5 text-lime-300" />
          </div>
          <h1 className="text-[26px] font-bold">Двофакторна автентифікація</h1>
          <p className="text-[15px] leading-snug text-zinc-400">
            Введіть 6-значний код з Google Authenticator, Authy або іншого TOTP-застосунку.
          </p>
        </div>

        {useRecoveryCode ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="oauth-recovery" className="text-sm text-zinc-300">
              Код відновлення
            </label>
            <input
              id="oauth-recovery"
              autoFocus
              value={recoveryCode}
              onChange={event => setRecoveryCode(event.target.value.toUpperCase())}
              placeholder="A1B2-C3D4"
              className={`${inputClassName} text-center tracking-[0.2em]`}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="oauth-code" className="text-sm text-zinc-300">
              Код автентифікації
            </label>
            <input
              id="oauth-code"
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className={`${inputClassName} h-13 border-lime-600 text-center text-2xl tracking-[0.3em]`}
            />
          </div>
        )}

        <label className="flex min-h-11 items-center gap-2.5 text-sm text-zinc-300">
          <input
            type="checkbox"
            className="size-4.5 accent-lime-700"
            checked={useRecoveryCode}
            onChange={event => setUseRecoveryCode(event.target.checked)}
          />
          Використати код відновлення
        </label>

        <OauthButton type="submit" disabled={isVerifying || !canSubmit}>
          {isVerifying ? <LoaderIcon className="size-4 animate-spin" /> : 'Підтвердити'}
        </OauthButton>

        <button
          type="button"
          className="cursor-pointer text-center text-sm text-lime-400 hover:text-lime-300"
          onClick={() => model.login.reset()}>
          Назад до входу
        </button>
      </form>
    </OauthCard>
  );
});

/** Screens 1 and 2: the regular VTG login, framed by the app asking for it. */
export const OauthLogin: FC<{ model: OauthState; client: SsoClient }> = observer(({ model, client }) =>
  model.login.step === 'twoFactor' ? (
    <TwoFactor model={model} client={client} />
  ) : (
    <Credentials model={model} client={client} />
  ),
);
