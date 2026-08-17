import { ChangePasswordDto, User } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { passwordSchema } from '@/shared/lib/password-schema';
import { changePasswordState, ChangePasswordState } from '../state/change-password.state';
import { LoaderIcon } from 'lucide-react';

const schema = z.object({
  oldPassword: z.string().min(1, "Старий пароль є обов'язковим"),
  newPassword: passwordSchema,
});

const ChangePassword: FC<{
  user: User | null;
  model?: ChangePasswordState;
}> = ({ user, model = changePasswordState }) => {
  const form = useForm<ChangePasswordDto>({
    mode: 'onChange',
    resolver: zodResolver(schema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
    },
  });

  const { isDirty, isValid, isSubmitting } = form.formState;

  const onSubmit = async (data: ChangePasswordDto) => {
    try {
      await model.changePassword(data);
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
    <form className="flex w-full max-w-sm flex-col gap-3" onSubmit={form.handleSubmit(onSubmit)}>
      <Input
        {...form.register('oldPassword')}
        label="Старий пароль"
        type="password"
        error={form.formState.errors.oldPassword?.message}
        disabled={isSubmitting}
      />
      <Input
        {...form.register('newPassword')}
        label="Новий пароль"
        type="password"
        error={form.formState.errors.newPassword?.message}
        disabled={isSubmitting}
      />
      <Button type="submit" disabled={!isDirty || !isValid || isSubmitting}>
        {isSubmitting ? <LoaderIcon className="w-4 h-4 animate-spin" /> : 'Змінити пароль'}
      </Button>
    </form>
  );
};

export default ChangePassword;
