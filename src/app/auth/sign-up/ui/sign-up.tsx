'use client';

import { ROUTES } from '@/shared/config/routes';
import { SignUpDto } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import { LoaderIcon } from 'lucide-react';
import Link from 'next/link';
import { FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { signUpState, SignUpState } from '../state/sign-up.state';
import { nicknameSchema } from '@/shared/lib/nickname-schema';
import { PASSWORD_REQUIREMENTS_HINT, passwordSchema } from '@/shared/lib/password-schema';
import { z } from 'zod';

type FormData = SignUpDto & {
  rePassword: string;
};

const signUpSchema = z
  .object({
    nickname: nicknameSchema,
    email: z.string().min(1, "Обов'язкове поле").email('Неправильний формат email'),
    password: passwordSchema,
    rePassword: z.string().min(1, "Обов'язкове поле"),
  })
  .refine(data => data.password === data.rePassword, {
    message: 'Паролі не співпадають',
    path: ['rePassword'],
  });

const SignUpForm: FC<{
  className?: string;
  state?: SignUpState;
}> = ({ className, state = signUpState }) => {
  const form = useForm<FormData>({
    mode: 'onTouched',
    defaultValues: {
      nickname: '',
      email: '',
      password: '',
      rePassword: '',
    },
    resolver: zodResolver(signUpSchema) as any,
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (data: FormData) => {
    try {
      await state.signUp({
        email: data.email,
        nickname: data.nickname.trim(),
        password: data.password,
      });
      state.setSuccessEmail(data.email);
    } catch (error) {
      if (error?.response?.data?.message === 'User already exists') {
        form.setError('nickname', { message: 'Такий користувач вже існує' });
      }
    }
  };

  useEffect(() => {
    return () => {
      state.reset();
    };
  }, [state]);

  if (state.successEmail) {
    return (
      <div className="flex flex-col gap-2 bg-card/70 p-4 w-full max-w-lg">
        <p className="text-center">
          На електронну пошту <span className="text-primary">{state.successEmail}</span> <br />
          відправлено лист для підтвердження.
        </p>

        <div className="flex flex-col gap-2 text-sm text-center">
          <p className="text-neutral-400">Якщо ви не знайдете лист, перевірте папку &quot;Спам&quot;.</p>
        </div>

        {state.successEmail.endsWith('@gmail.com') && (
          <Link className="text-center mt-2" href={`https://mail.google.com/mail`} target="_blank">
            <Button className="uppercase" size="lg">
              Відкрити Gmail
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={classNames('max-w-lg flex flex-col paper p-4', className)}>
      <h2 className="text-2xl font-bold mb-4 text-center">Створити аккаунт</h2>

      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <Input {...field} label="Позивний" autoFocus error={form.formState.errors.nickname?.message} />
          )}
        />
        <Controller
          control={form.control}
          name="email"
          render={({ field }) => <Input {...field} label="Email" error={form.formState.errors.email?.message} />}
        />

        <Controller
          control={form.control}
          name="password"
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <Input {...field} type="password" label="Пароль" error={form.formState.errors.password?.message} />
              <p className="text-xs text-zinc-500">{PASSWORD_REQUIREMENTS_HINT}</p>
            </div>
          )}
        />

        <Controller
          control={form.control}
          name="rePassword"
          render={({ field }) => (
            <Input
              {...field}
              type="password"
              label="Повторіть пароль"
              error={form.formState.errors.rePassword?.message}
            />
          )}
        />

        <Button className="uppercase" type="submit" disabled={isSubmitting || !isValid}>
          {isSubmitting ? <LoaderIcon className="size-4 animate-spin" /> : 'Зареєструватися'}
        </Button>
      </form>
    </div>
  );
};

export { SignUpForm };
