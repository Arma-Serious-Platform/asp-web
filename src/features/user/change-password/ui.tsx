import { ChangePasswordDto, User } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { yupResolver } from '@hookform/resolvers/yup';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { changePassword, ChangePasswordModel } from './model';
import { LoaderIcon } from 'lucide-react';

const ChangePassword: FC<{
  user: User | null;
  model?: ChangePasswordModel;
}> = ({ user, model = changePassword }) => {
  const schema = yup.object().shape({
    oldPassword: yup.string().required('Старий пароль є обов\'язковим'),
    newPassword: yup
      .string()
      .min(8, 'Новий пароль повинен містити 8 символів')
      .required('Новий пароль є обов\'язковим'),
  });

  const form = useForm<ChangePasswordDto>({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
    },
  });

  const { isDirty, isValid, isSubmitting } = form.formState;

  const onSubmit = async (data: ChangePasswordDto) => {
    try {
      await model.changePassword(data);
      // TODO: add success toaster
    } catch (error) {
      console.error(error);
      if (error?.response?.data?.message === 'Invalid old password') {
        form.setError('oldPassword', {
          message: 'Старий пароль невірний',
        });
      }
    }
  };

  if (!user) return null;

  return (
    <form
      className='flex flex-col gap-4 min-w-96'
      onSubmit={form.handleSubmit(onSubmit)}>
      <Input
        {...form.register('oldPassword')}
        label='Старий пароль'
        type='password'
        error={form.formState.errors.oldPassword?.message}
        disabled={isSubmitting}
      />
      <Input
        {...form.register('newPassword')}
        label='Новий пароль'
        type='password'
        error={form.formState.errors.newPassword?.message}
        disabled={isSubmitting}
      />
      <Button type='submit' disabled={!isDirty || !isValid || isSubmitting}>
        {isSubmitting ? (
          <LoaderIcon className='w-4 h-4 animate-spin' />
        ) : (
          'Змінити пароль'
        )}
      </Button>
    </form>
  );
};

export default ChangePassword;
