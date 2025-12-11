'use client';

import { ROUTES } from '@/shared/config/routes';
import { LoginDto } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { yupResolver } from '@hookform/resolvers/yup';
import classNames from 'classnames';
import { LoaderIcon } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { loginModel, LoginModel } from './model';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';

const LoginForm: FC<{
  className?: string;
  model?: LoginModel;
}> = ({ className, model = loginModel }) => {
  const schema = yup.object().shape({
    email: yup
      .string()
      .required("Обов'язкове поле"),
    password: yup.string().required("Обов'язкове поле"),
  });

  const form = useForm<LoginDto>({
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: yupResolver(schema),
  });

  const { isValid, isSubmitting } = form.formState;

  const router = useRouter();

  const onSubmit = async (data: LoginDto) => {
    try {
      await model.login(data);

      router.refresh();

      router.push(`${ROUTES.user.profile}?tab=profile`);
    } catch (error) {
      if (error?.response?.data?.message === 'Invalid credentials') {
        form.setError('password', { message: 'Неправильний email або пароль' });
      }
    }
  };

  return (
    <div
      className={classNames(
        'max-w-lg flex flex-col border border-primary bg-card p-4 rounded-sm',
        className
      )}>
      <h2 className='text-2xl font-bold mb-4 text-center'>Увійти</h2>

      <form
        className='flex flex-col gap-4'
        onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          control={form.control}
          name='email'
          render={({ field }) => (
            <Input
              {...field}
              autoFocus
              label='Нікнейм або email'
              error={form.formState.errors.email?.message}
            />
          )}
        />

        <Controller
          control={form.control}
          name='password'
          render={({ field }) => (
            <Input
              {...field}
              type='password'
              label='Пароль'
              error={form.formState.errors.password?.message}
            />
          )}
        />

        <div className='flex justify-between gap-1'>
          <span className='text-sm text-muted-foreground'>
            <Link href={ROUTES.auth.forgotPassword}>Забули пароль?</Link>
          </span>
          <span className='text-sm text-muted-foreground'>
            <Link href={ROUTES.auth.signup}>Ще не маєте аккаунту?</Link>
          </span>
        </div>

        <Button
          className='uppercase'
          type='submit'
          disabled={isSubmitting || !isValid}>
          {isSubmitting ? (
            <LoaderIcon className='size-4 animate-spin' />
          ) : (
            'Увійти'
          )}
        </Button>
      </form>
    </div>
  );
};

export { LoginForm };
