import { Button } from '@/shared/ui/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/organisms/dialog';
import { observer } from 'mobx-react-lite';
import { FC, PropsWithChildren, useState } from 'react';
import { banUnbanUserModel, BanUnbanUserModel } from './model';
import { Input } from '@/shared/ui/atoms/input';
import { User, UserStatus } from '@/shared/sdk/types';
import dayjs from 'dayjs';
const BanUnbanUserModal: FC<
  PropsWithChildren<{
    model?: BanUnbanUserModel;
    onBanSuccess?: (user: User) => void;
    onUnbanSuccess?: (user: User) => void;
  }>
> = observer(({ model = banUnbanUserModel, children, onBanSuccess, onUnbanSuccess }) => {
  const [banTime, setBanTime] = useState('');

  const isBanAction =
    model.visibility?.payload?.user?.status !== UserStatus.BANNED;

  return (
    <Dialog
      open={model.visibility.isOpen}
      onOpenChange={model.visibility.switch}>
      <DialogOverlay />
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Ви впевнені, що хочете {isBanAction ? ' забанити ' : ' розбанити '}
            гравця{' '}
            <span className='text-primary'>
              {model.visibility?.payload?.user?.nickname}
            </span>
            ?
          </DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-2'>
          {isBanAction && (
            <Input
              placeholder='Час бану'
              type='datetime-local'
              onChange={(e) => setBanTime(e.target.value)}
            />
          )}

          <div className='flex justify-between mt-4'>
            <Button variant='outline' onClick={() => model.visibility.close()}>
              Скасувати
            </Button>
            <Button
              variant={isBanAction ? 'destructive' : 'default'}
              onClick={() => {
                if (isBanAction) {
                  model.banUser(
                    {
                      userId: model.visibility?.payload?.user?.id || '',
                      bannedUntil: banTime ? dayjs(banTime).toDate() : null,
                    },
                    onBanSuccess
                  );
                } else {
                  model.unbanUser(
                    model.visibility?.payload?.user?.id || '',
                    onUnbanSuccess
                  );
                }
              }}>
              {isBanAction ? 'Забанити' : 'Розбанити'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export { BanUnbanUserModal };
