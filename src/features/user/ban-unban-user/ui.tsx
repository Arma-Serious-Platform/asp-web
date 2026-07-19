import { session } from '@/entities/session/model';
import { Button } from '@/shared/ui/atoms/button';
import { Checkbox } from '@/shared/ui/atoms/checkbox';
import { Input } from '@/shared/ui/atoms/input';
import { Textarea } from '@/shared/ui/atoms/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/organisms/dialog';
import { User, UserStatus } from '@/shared/sdk/types';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { banUnbanUserModel, BanUnbanUserModel } from './model';

const BanUnbanUserModal: FC<
  PropsWithChildren<{
    model?: BanUnbanUserModel;
    onBanSuccess?: (user: User) => void;
    onUnbanSuccess?: (user: User) => void;
  }>
> = observer(({ model = banUnbanUserModel, children, onBanSuccess, onUnbanSuccess }) => {
  const [banTime, setBanTime] = useState('');
  const [reason, setReason] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);
  const [mute, setMute] = useState(false);

  const user = model.visibility?.payload?.user;
  const isBanAction = user?.status !== UserStatus.BANNED;
  const canUsePermanentBan = session.canPermanentlyBanUsers;

  useEffect(() => {
    if (!model.visibility.isOpen) {
      setBanTime('');
      setReason('');
      setIsPermanent(false);
      setMute(false);
    }
  }, [model.visibility.isOpen]);

  const submit = () => {
    if (!user) return;

    if (!isBanAction) {
      model.unbanUser(user.id, reason.trim(), onUnbanSuccess);
      return;
    }

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      toast.error('Вкажіть причину блокування');
      return;
    }

    if (isPermanent) {
      model.permanentlyBanUser(user.id, trimmedReason, onBanSuccess);
      return;
    }

    if (!banTime) {
      toast.error('Оберіть час тимчасового блокування');
      return;
    }

    model.banUser(
      {
        userId: user.id,
        bannedUntil: dayjs(banTime).toDate(),
        reason: trimmedReason,
        mute,
      },
      onBanSuccess,
    );
  };

  return (
    <Dialog open={model.visibility.isOpen} onOpenChange={model.visibility.switch}>
      <DialogOverlay />
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Ви впевнені, що хочете {isBanAction ? 'заблокувати' : 'розблокувати'} гравця{' '}
            <span className="text-primary">{user?.nickname}</span>?
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {isBanAction && (
            <>
              {canUsePermanentBan && (
                <button
                  type="button"
                  aria-pressed={isPermanent}
                  className="flex items-center gap-2 text-sm text-zinc-100"
                  onClick={() => {
                    setIsPermanent(value => !value);
                    setMute(false);
                  }}>
                  <Checkbox checked={isPermanent} />
                  Перманентне блокування
                </button>
              )}

              {!isPermanent && (
                <>
                  <Input
                    label="Час блокування"
                    type="datetime-local"
                    value={banTime}
                    onChange={e => setBanTime(e.target.value)}
                  />
                  <button
                    type="button"
                    aria-pressed={mute}
                    className="flex items-center gap-2 text-sm text-zinc-100"
                    onClick={() => setMute(value => !value)}>
                    <Checkbox checked={mute} />
                    Заборонити писати повідомлення та коментарі
                  </button>
                </>
              )}
            </>
          )}

          <Textarea
            label={isBanAction ? 'Причина блокування' : 'Коментар до розблокування'}
            value={reason}
            onChange={event => setReason(event.target.value)}
            placeholder={isBanAction ? 'Наприклад: порушення правила 6.26' : 'Можна залишити порожнім'}
          />

          <div className="flex justify-between mt-2">
            <Button variant="outline" disabled={model.loader.isLoading} onClick={() => model.visibility.close()}>
              Скасувати
            </Button>
            <Button
              variant={isBanAction ? 'destructive' : 'default'}
              disabled={model.loader.isLoading}
              onClick={submit}>
              {isBanAction ? 'Заблокувати' : 'Розблокувати'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export { BanUnbanUserModal };
