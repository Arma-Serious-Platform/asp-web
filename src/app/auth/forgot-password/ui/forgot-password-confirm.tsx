'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import { FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { forgotPasswordConfirmState, ForgotPasswordConfirmState } from '../state/forgot-password-confirm.state';
import { z } from 'zod';
import { passwordSchema } from '@/shared/lib/password-schema';
import { toast } from 'react-hot-toast';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/config/routes';

type FormData = {
  password: string;
  confirmPassword: string;
};

const forgotPasswordConfirmSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Обов'язкове поле"),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Паролі не співпадають',
    path: ['confirmPassword'],
  });

const ForgotPasswordConfirmForm: FC<{
  className?: string;
  token: string;
  state?: ForgotPasswordConfirmState;
}> = observer(({ className, token, state = forgotPasswordConfirmState }) => {
  const router = useRouter();

  const form = useForm<FormData>({
    mode: 'onTouched',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(forgotPasswordConfirmSchema),
  });

  const onSubmit = async ({ password }: FormData) => {
    try {
      await state.forgotPassword({
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
      state.reset();
    };
  }, [state]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={classNames('max-w-lg flex flex-col paper p-4', className)}>
      <h2 className="text-2xl font-bold mb-4 text-center">Зміна паролю</h2>

      <div className="flex flex-col gap-4 min-w-96">
        <Controller
          control={form.control}
          name="password"
          render={({ field }) => (
            <Input
              {...field}
              className="w-full"
              label="Пароль"
              type="password"
              error={form.formState.errors.password?.message}
            />
          )}
        />

        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <Input
              {...field}
              className="w-full"
              label="Повторіть пароль"
              type="password"
              error={form.formState.errors.confirmPassword?.message}
            />
          )}
        />
      </div>

      <Button type="submit" className="mt-4" disabled={isSubmitting || !isValid || !isDirty}>
        Змінити пароль
      </Button>
    </form>
  );
});

export { ForgotPasswordConfirmForm };
