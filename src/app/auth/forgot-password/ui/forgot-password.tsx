'use client';

import { ROUTES } from '@/shared/config/routes';
import { ForgotPasswordDto } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import { LoaderIcon } from 'lucide-react';
import Link from 'next/link';
import { FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { forgotPasswordState, ForgotPasswordState } from '../state/forgot-password.state';
import { z } from 'zod';
import { View } from '@/features/view';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Обов'язкове поле").email('Неправильний формат email'),
});

const ForgotPasswordForm: FC<{
  className?: string;
  state?: ForgotPasswordState;
}> = ({ className, state = forgotPasswordState }) => {
  const form = useForm<ForgotPasswordDto>({
    mode: 'onTouched',
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(forgotPasswordSchema),
  });

  const { isValid, isSubmitting } = form.formState;
  const { email } = form.watch();

  const onSubmit = async (data: ForgotPasswordDto) => {
    try {
      await state.forgotPassword(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    return () => {
      state.reset();
    };
  }, [state]);

  return (
    <div className={classNames('max-w-lg flex flex-col paper p-4', className)}>
      <h2 className="text-2xl font-bold mb-4 text-center">Відновити пароль</h2>

      <View.Condition if={state.isSended || state.isAlreadySended}>
        <div className="flex flex-col gap-2 text-center justify-center">
          <p>
            {state.isAlreadySended
              ? `На електронну пошту ${email} вже був раніше відправлений лист для відновлення пароля.`
              : `На електронну пошту ${email} відправлено лист для відновлення пароля.`}
          </p>

          <View.Condition if={email.endsWith('@gmail.com')}>
            <Link href={`https://mail.google.com/mail`} target="_blank">
              <Button className="uppercase" size="lg" variant="outline">
                Відкрити Gmail
              </Button>
            </Link>
          </View.Condition>
        </div>
      </View.Condition>

      <View.Condition if={!state.isSended && !state.isAlreadySended}>
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Controller
            control={form.control}
            name="email"
            render={({ field }) => <Input {...field} label="Email" error={form.formState.errors.email?.message} />}
          />

          <Button className="uppercase" type="submit" disabled={isSubmitting || !isValid}>
            {isSubmitting ? <LoaderIcon className="size-4 animate-spin" /> : 'Відновити пароль'}
          </Button>
        </form>
      </View.Condition>
    </div>
  );
};

export { ForgotPasswordForm };
