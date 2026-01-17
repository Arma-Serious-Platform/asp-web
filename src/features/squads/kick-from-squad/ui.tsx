'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from '@/shared/ui/organisms/dialog';
import { Preloader } from '@/shared/ui/atoms/preloader';
import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { KickFromSquadModel, kickFromSquadModel } from './model';
import { User } from '@/shared/sdk/types';

const KickFromSquadModal: FC<{
  model?: KickFromSquadModel;
  onKickSuccess?: (user: User) => void;
}> = observer(({ model = kickFromSquadModel, onKickSuccess }) => {
  const handleKick = () => {
    if (!model.visibility.payload?.user) {
      return;
    }

    model.kickUser(model.visibility.payload.user.id, onKickSuccess);
  };

  const user = model.visibility.payload?.user;

  return (
    <Dialog open={model.visibility.isOpen} onOpenChange={model.visibility.switch}>
      <DialogOverlay />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Ви впевнені, що хочете вилучити гравця <span className="text-primary">{user?.nickname}</span> з загону?
          </DialogTitle>
        </DialogHeader>

        <Preloader isLoading={model.loader.isLoading}>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-zinc-400">
              Ця дія незворотна. Гравець буде вилучений з загону і зможе приєднатися до іншого загону або отримати нове
              запрошення.
            </p>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => model.visibility.close()}>
                Скасувати
              </Button>
              <Button variant="destructive" onClick={handleKick} disabled={model.loader.isLoading}>
                Вилучити з загону
              </Button>
            </div>
          </div>
        </Preloader>
      </DialogContent>
    </Dialog>
  );
});

export { KickFromSquadModal };
