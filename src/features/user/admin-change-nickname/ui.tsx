import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/organisms/dialog';
import { User } from '@/shared/sdk/types';
import { observer } from 'mobx-react-lite';
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminChangeNicknameModel, AdminChangeNicknameModel } from './model';

const AdminChangeNicknameModal: FC<
  PropsWithChildren<{
    model?: AdminChangeNicknameModel;
    onSuccess?: (user: User) => void;
  }>
> = observer(({ model = adminChangeNicknameModel, children, onSuccess }) => {
  const [nickname, setNickname] = useState('');
  const user = model.visibility.payload?.user;

  useEffect(() => {
    if (model.visibility.isOpen) {
      setNickname(user?.nickname ?? '');
    }
  }, [model.visibility.isOpen, user?.nickname]);

  const submit = () => {
    const trimmedNickname = nickname.trim();

    if (trimmedNickname.length < 2) {
      toast.error('Позивний має містити мінімум 2 символи');
      return;
    }

    model.changeNickname(trimmedNickname, onSuccess);
  };

  return (
    <Dialog open={model.visibility.isOpen} onOpenChange={model.visibility.switch}>
      <DialogOverlay />
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Змінити позивний <span className="text-primary">{user?.nickname}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            label="Новий позивний"
            value={nickname}
            autoFocus
            disabled={model.loader.isLoading}
            onChange={event => setNickname(event.target.value)}
          />

          <div className="flex justify-between mt-2">
            <Button variant="outline" disabled={model.loader.isLoading} onClick={() => model.visibility.close()}>
              Скасувати
            </Button>
            <Button disabled={model.loader.isLoading || nickname.trim() === user?.nickname} onClick={submit}>
              Зберегти
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export { AdminChangeNicknameModal };
