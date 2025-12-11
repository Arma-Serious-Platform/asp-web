'use client';

import { ROUTES } from '@/shared/config/routes';
import { SignUpDto } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { yupResolver } from '@hookform/resolvers/yup';
import classNames from 'classnames';
import { LoaderIcon } from 'lucide-react';
import Link from 'next/link';
import { FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { signUpModel, SignUpModel } from './model';
import * as yup from 'yup';

type FormData = SignUpDto & {
  rePassword: string;
};

const SignUpForm: FC<{
  className?: string;
  model?: SignUpModel;
}> = ({ className, model = signUpModel }) => {
  const schema = yup.object().shape({
    nickname: yup
      .string()
      .min(3, 'Мінімум 3 символи')
      .required("Обов'язкове поле"),
    email: yup
      .string()
      .email('Неправильний формат email')
      .required("Обов'язкове поле"),
    password: yup.string().required("Обов'язкове поле"),
    rePassword: yup
      .string()
      .required("Обов'язкове поле")
      .test('re-password', 'Паролі не співпадають', (value, context) => {
        return value === context.parent.password;
      }),
  });

  const form = useForm<FormData>({
    mode: 'onTouched',
    defaultValues: {
      nickname: '',
      email: '',
      password: '',
      rePassword: '',
    },
    resolver: yupResolver(schema),
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (data: FormData) => {
    try {
      await model.signUp({
        email: data.email,
        nickname: data.nickname,
        password: data.password,
      });
      model.setSuccessEmail(data.email);
    } catch (error) {
      if (error?.response?.data?.message === 'User already exists') {
        form.setError('password', { message: 'Такий користувач вже існує' });
      }
    }
  };

  useEffect(() => {
    return () => {
      model.reset();
    };
  }, [model]);

  if (model.successEmail) {
    return (
      <div className='flex flex-col gap-2 bg-card/70 p-4 w-full max-w-lg'>
        <p className='text-center'>
          На електронну пошту{' '}
          <span className='text-primary'>{model.successEmail}</span> <br />
          відправлено лист для підтвердження.
        </p>

        <div className='flex flex-col gap-2 text-sm text-center'>
          <p className='text-neutral-400'>
            Якщо ви не знайдете лист, перевірте папку &quot;Спам&quot;.
          </p>
        </div>

        {model.successEmail.endsWith('@gmail.com') && (
          <Link
            className='text-center mt-2'
            href={`https://mail.google.com/mail`}
            target='_blank'>
            <Button className='uppercase' size='lg'>
              Відкрити Gmail
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'max-w-lg flex flex-col border border-primary bg-card p-4 rounded-sm',
        className
      )}>
      <h2 className='text-2xl font-bold mb-4 text-center'>Створити аккаунт</h2>

      <form
        className='flex flex-col gap-4'
        onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          control={form.control}
          name='nickname'
          render={({ field }) => (
            <Input
              {...field}
              label='Позивний'
              autoFocus
              error={form.formState.errors.nickname?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name='email'
          render={({ field }) => (
            <Input
              {...field}
              label='Email'
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

        <Controller
          control={form.control}
          name='rePassword'
          render={({ field }) => (
            <Input
              {...field}
              type='password'
              label='Повторіть пароль'
              error={form.formState.errors.rePassword?.message}
            />
          )}
        />

        <Button
          className='uppercase'
          type='submit'
          disabled={isSubmitting || !isValid}>
          {isSubmitting ? (
            <LoaderIcon className='size-4 animate-spin' />
          ) : (
            'Зареєструватися'
          )}
        </Button>
      </form>
    </div>
  );
};

export { SignUpForm };
