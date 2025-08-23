'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { yupResolver } from '@hookform/resolvers/yup';
import classNames from 'classnames';
import { FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  forgotPasswordConfirmModel,
  ForgotPasswordConfirmModel,
} from './model';
import * as yup from 'yup';

import { FormDto } from './lib';
import { toast } from 'react-hot-toast';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/config/routes';
const ForgotPasswordConfirmForm: FC<{
  className?: string;
  token: string;
  model?: ForgotPasswordConfirmModel;
}> = observer(({ className, token, model = forgotPasswordConfirmModel }) => {
  const router = useRouter();
  const schema = yup.object().shape({
    password: yup
      .string()
      .min(8, 'Пароль повинен бути не менше 8 символів')
      .required("Обов'язкове поле"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password'), null], 'Паролі не співпадають')
      .required("Обов'язкове поле"),
  });

  const form = useForm<FormDto>({
    mode: 'onTouched',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    resolver: yupResolver(schema),
  });

  const onSubmit = async ({ password }: FormDto) => {
    try {
      await model.forgotPassword({
        token,
        newPassword: password,
      });

      router.push(ROUTES.auth.login);
      toast.success('Пароль успішно змінено', { position: 'bottom-center' });
    } catch {
      form.setError('confirmPassword', {
        message: 'Термін дії токену закінчився',
      });
    }
  };

  const { isSubmitting, isValid, isDirty } = form.formState;

  useEffect(() => {
    return () => {
      model.reset();
    };
  }, [model]);

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={classNames(
        'max-w-lg flex flex-col border border-primary bg-card p-4',
        className
      )}>
      <h2 className='text-2xl font-bold mb-4 text-center'>Зміна паролю</h2>

      <div className='flex flex-col gap-4'>
        <Controller
          control={form.control}
          name='password'
          render={({ field }) => (
            <Input
              {...field}
              placeholder='Пароль'
              type='password'
              error={form.formState.errors.password?.message}
            />
          )}
        />

        <Controller
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <Input
              {...field}
              placeholder='Повторіть пароль'
              type='password'
              error={form.formState.errors.confirmPassword?.message}
            />
          )}
        />
      </div>

      <Button
        type='submit'
        className='mt-4'
        disabled={isSubmitting || !isValid || !isDirty}>
        Змінити пароль
      </Button>
    </form>
  );
});

export { ForgotPasswordConfirmForm };
