'use client';

import { UserNicknameText } from '@/entities/user/ui/user-text';
import { ChangeNicknameDto, User } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { Preloader } from '@/shared/ui/atoms/preloader';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from '@/shared/ui/organisms/dialog';
import { yupResolver } from '@hookform/resolvers/yup';
import { isAxiosError } from 'axios';
import { LoaderIcon, PencilIcon, UserIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { FC, useEffect } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { ChangeNicknameModel } from './model';

const schema = yup.object().shape({
  nickname: yup.string().trim().min(2, 'Мінімум 2 символи').required("Обов'язкове поле"),
});

const ChangeNicknameModal: FC<{
  model: ChangeNicknameModel;
  user: User | null;
  onSuccess?: () => void;
}> = observer(({ model, user, onSuccess }) => {
  const form = useForm<ChangeNicknameDto>({
    mode: 'onChange',
    resolver: yupResolver(schema) as Resolver<ChangeNicknameDto>,
    defaultValues: {
      nickname: user?.nickname ?? '',
    },
  });

  const { isDirty, isValid } = form.formState;
  const isLoading = model.loader.isLoading;

  useEffect(() => {
    if (model.modal.isOpen) {
      form.reset({ nickname: user?.nickname ?? '' });
    }
  }, [model.modal.isOpen, user?.nickname, form]);

  const onSubmit = async (data: ChangeNicknameDto) => {
    try {
      await model.changeNickname({ nickname: data.nickname.trim() });
      onSuccess?.();
    } catch (error) {
      if (
        isAxiosError(error) &&
        (error.response?.data?.message === 'User already exists' ||
          error.response?.data?.message === 'Nickname is already taken')
      ) {
        form.setError('nickname', { message: 'Такий позивний вже зайнятий' });
      }
    }
  };

  return (
    <Dialog open={model.modal.isOpen} onOpenChange={model.modal.switch}>
      <DialogOverlay />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Змінити позивний</DialogTitle>
        </DialogHeader>
        <Preloader isLoading={isLoading}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Input
              {...form.register('nickname')}
              label="Позивний"
              autoFocus
              error={form.formState.errors.nickname?.message}
              disabled={isLoading}
            />
            <div className="flex justify-between gap-2">
              <Button type="button" variant="outline" disabled={isLoading} onClick={() => model.modal.close()}>
                Скасувати
              </Button>
              <Button type="submit" disabled={!isDirty || !isValid || isLoading}>
                {isLoading ? <LoaderIcon className="size-4 animate-spin" /> : 'Зберегти'}
              </Button>
            </div>
          </form>
        </Preloader>
      </DialogContent>
    </Dialog>
  );
});

const ProfileNickname: FC<{
  user: User | null;
  model: ChangeNicknameModel;
}> = observer(({ user, model }) => {
  if (!user) return null;

  return (
    <div className="flex items-center gap-2 text-lg font-semibold text-white">
      <UserIcon className="size-5 shrink-0 text-primary" />
      <UserNicknameText user={user} tag={user.squad?.tag} sideType={user.squad?.side?.type} link={false} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 text-zinc-400 hover:text-white"
        aria-label="Змінити позивний"
        onClick={() => model.modal.open()}>
        <PencilIcon className="size-4" />
      </Button>
    </div>
  );
});

export { ChangeNicknameModal, ProfileNickname };
