'use client';

import { ROUTES } from '@/shared/config/routes';
import { ForgotPasswordDto, LoginDto } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { yupResolver } from '@hookform/resolvers/yup';
import classNames from 'classnames';
import { LoaderIcon } from 'lucide-react';
import Link from 'next/link';
import { FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { forgotPasswordModel, ForgotPasswordModel } from './model';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import { View } from '@/features/view';

const ForgotPasswordForm: FC<{
  className?: string;
  model?: ForgotPasswordModel;
}> = ({ className, model = forgotPasswordModel }) => {
  const schema = yup.object().shape({
    email: yup
      .string()
      .email('Неправильний формат email')
      .required("Обов'язкове поле"),
  });

  const form = useForm<ForgotPasswordDto>({
    mode: 'onTouched',
    defaultValues: {
      email: '',
    },
    resolver: yupResolver(schema),
  });

  const { isValid, isSubmitting } = form.formState;
  const { email } = form.watch();

  const onSubmit = async (data: ForgotPasswordDto) => {
    try {
      await model.forgotPassword(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    return () => {
      model.reset();
    };
  }, [model]);

  return (
    <div
      className={classNames(
        'max-w-lg flex flex-col border border-primary bg-card p-4',
        className
      )}>
      <h2 className='text-2xl font-bold mb-4 text-center'>Відновити пароль</h2>

      <View.Condition if={model.isSended || model.isAlreadySended}>
        <div className='flex flex-col gap-2 text-center justify-center'>
          <p>
            {model.isAlreadySended
              ? `На електронну пошту ${email} вже був раніше відправлений лист для відновлення пароля.`
              : `На електронну пошту ${email} відправлено лист для відновлення пароля.`}
          </p>

          <View.Condition if={email.endsWith('@gmail.com')}>
            <Link href={`https://mail.google.com/mail`} target='_blank'>
              <Button className='uppercase' size='lg' variant='outline'>
                Відкрити Gmail
              </Button>
            </Link>
          </View.Condition>
        </div>
      </View.Condition>

      <View.Condition if={!model.isSended && !model.isAlreadySended}>
        <form
          className='flex flex-col gap-4'
          onSubmit={form.handleSubmit(onSubmit)}>
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

          <Button
            className='uppercase'
            type='submit'
            disabled={isSubmitting || !isValid}>
            {isSubmitting ? (
              <LoaderIcon className='size-4 animate-spin' />
            ) : (
              'Відновити пароль'
            )}
          </Button>
        </form>
      </View.Condition>
    </div>
  );
};

export { ForgotPasswordForm };
