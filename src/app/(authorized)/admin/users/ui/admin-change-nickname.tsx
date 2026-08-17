import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/ui/organisms/drawer';
import { User } from '@/shared/sdk/types';
import { observer } from 'mobx-react-lite';
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { getNicknameValidationError } from '@/shared/lib/nickname-schema';
import toast from 'react-hot-toast';
import { adminChangeNicknameState, AdminChangeNicknameState } from '../state/admin-change-nickname.state';

const AdminChangeNicknameModal: FC<
  PropsWithChildren<{
    model?: AdminChangeNicknameState;
    onSuccess?: (user: User) => void;
  }>
> = observer(({ model = adminChangeNicknameState, children, onSuccess }) => {
  const [nickname, setNickname] = useState('');
  const user = model.visibility.payload?.user;

  useEffect(() => {
    if (model.visibility.isOpen) {
      setNickname(user?.nickname ?? '');
    }
  }, [model.visibility.isOpen, user?.nickname]);

  const submit = () => {
    const trimmedNickname = nickname.trim();

    const nicknameError = getNicknameValidationError(trimmedNickname);

    if (nicknameError) {
      toast.error(nicknameError);
      return;
    }

    model.changeNickname(trimmedNickname, onSuccess);
  };

  return (
    <Drawer open={model.visibility.isOpen} onOpenChange={model.visibility.switch}>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
      <DrawerContent>
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <DrawerHeader>
            <DrawerTitle>
              Змінити позивний <span className="text-primary">{user?.nickname}</span>
            </DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <Input
              label="Новий позивний"
              value={nickname}
              autoFocus
              disabled={model.loader.isLoading}
              onChange={event => setNickname(event.target.value)}
            />
          </DrawerBody>

          <DrawerFooter className="border-t border-white/10 pt-4 sm:flex-row sm:justify-between">
            <Button variant="outline" disabled={model.loader.isLoading} onClick={() => model.visibility.close()}>
              Скасувати
            </Button>
            <Button disabled={model.loader.isLoading || nickname.trim() === user?.nickname} onClick={submit}>
              Зберегти
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
});

export { AdminChangeNicknameModal };
