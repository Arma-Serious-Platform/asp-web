'use client';

import { ROUTES } from '@/shared/config/routes';
import { LoginDto } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import { LoaderIcon } from 'lucide-react';
import Link from 'next/link';
import { FC, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { loginState, LoginState } from '../state/login.state';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { observer } from 'mobx-react-lite';
import { getLoginErrorKind, showActivationToast } from '../lib/login-error';

const loginSchema = z.object({
  email: z.string().min(1, "Обов'язкове поле"),
  password: z.string().min(1, "Обов'язкове поле"),
});

const LoginForm: FC<{
  className?: string;
  state?: LoginState;
}> = observer(({ className, state = loginState }) => {
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [isVerifyingTwoFactor, setIsVerifyingTwoFactor] = useState(false);

  const form = useForm<LoginDto>({
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(loginSchema) as any,
  });

  const { isValid, isSubmitting } = form.formState;

  const router = useRouter();

  const handleLoginError = (error: unknown) => {
    const kind = getLoginErrorKind(error);

    if (kind === 'failed') {
      toast.error('Не вдалося увійти. Спробуйте ще раз.');
    } else if (kind === 'permanentBan') {
      toast.error('Вас забанено назавжди');
    } else if (kind === 'invalidCredentials') {
      form.setError('password', { message: 'Неправильний email або пароль' });
    } else if (kind === 'confirmEmail' || kind === 'activationResent') {
      showActivationToast(kind);
    }
  };

  const onSubmit = async (data: LoginDto) => {
    try {
      const user = await state.login(data);

      if (!user) {
        return;
      }

      router.refresh();
      router.push(`${ROUTES.user.profile}?tab=profile`);
    } catch (error) {
      handleLoginError(error);
    }
  };

  const onVerifyTwoFactor = async () => {
    setIsVerifyingTwoFactor(true);

    try {
      await state.verifyTwoFactor(
        useRecoveryCode ? undefined : twoFactorCode.trim(),
        useRecoveryCode ? recoveryCode.trim() : undefined,
      );

      router.refresh();
      router.push(`${ROUTES.user.profile}?tab=profile`);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error('Невірний код автентифікації');
        return;
      }

      toast.error('Не вдалося підтвердити вхід');
    } finally {
      setIsVerifyingTwoFactor(false);
    }
  };

  if (state.step === 'twoFactor') {
    return (
      <div className={classNames('max-w-lg flex flex-col paper p-4', className)}>
        <h2 className="text-2xl font-bold mb-2 text-center">Двофакторна автентифікація</h2>
        <p className="mb-4 text-center text-sm text-zinc-400">
          Введіть 6-значний код з Google Authenticator, Authy або іншого TOTP-застосунку.
        </p>

        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={useRecoveryCode}
              onChange={event => setUseRecoveryCode(event.target.checked)}
            />
            Використати код відновлення
          </label>

          {useRecoveryCode ? (
            <Input
              label="Код відновлення"
              autoFocus
              value={recoveryCode}
              onChange={event => setRecoveryCode(event.target.value.toUpperCase())}
              placeholder="A1B2-C3D4"
            />
          ) : (
            <Input
              label="Код з застосунку"
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              value={twoFactorCode}
              onChange={event => setTwoFactorCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
            />
          )}

          <Button
            className="uppercase"
            type="button"
            disabled={
              isVerifyingTwoFactor || (useRecoveryCode ? recoveryCode.trim().length === 0 : twoFactorCode.length !== 6)
            }
            onClick={onVerifyTwoFactor}>
            {isVerifyingTwoFactor ? <LoaderIcon className="size-4 animate-spin" /> : 'Підтвердити'}
          </Button>

          <Button type="button" variant="outline" onClick={() => state.reset()}>
            Назад
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={classNames('max-w-lg flex flex-col paper p-4', className)}>
      <h2 className="text-2xl font-bold mb-4 text-center">Увійти</h2>

      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          control={form.control}
          name="email"
          render={({ field }) => (
            <Input {...field} autoFocus label="Нікнейм або email" error={form.formState.errors.email?.message} />
          )}
        />

        <Controller
          control={form.control}
          name="password"
          render={({ field }) => (
            <Input {...field} type="password" label="Пароль" error={form.formState.errors.password?.message} />
          )}
        />

        <div className="flex justify-between gap-1">
          <span className="text-sm text-muted-foreground">
            <Link href={ROUTES.auth.forgotPassword}>Забули пароль?</Link>
          </span>
          <span className="text-sm text-muted-foreground">
            <Link href={ROUTES.auth.signup}>Ще не маєте аккаунту?</Link>
          </span>
        </div>

        <Button className="uppercase" type="submit" disabled={isSubmitting || !isValid}>
          {isSubmitting ? <LoaderIcon className="size-4 animate-spin" /> : 'Увійти'}
        </Button>
      </form>
    </div>
  );
});

export { LoginForm };
