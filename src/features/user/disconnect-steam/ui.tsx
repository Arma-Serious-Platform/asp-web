'use client';

import { DisconnectSteamModel } from './model';
import { Button } from '@/shared/ui/atoms/button';
import { Preloader } from '@/shared/ui/atoms/preloader';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from '@/shared/ui/organisms/dialog';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';

const DisconnectSteamModal: FC<{
  model: DisconnectSteamModel;
  onSuccess?: () => void;
}> = observer(({ model, onSuccess }) => {
  const handleConfirm = () => {
    void model.disconnect(onSuccess);
  };

  return (
    <Dialog open={model.modal.isOpen} onOpenChange={model.modal.switch}>
      <DialogOverlay />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Відв&apos;язати Steam?</DialogTitle>
        </DialogHeader>
        <Preloader isLoading={model.loader.isLoading}>
          <p className="text-sm text-zinc-400">
            Після відв&apos;язування ви не зможете грати на сервері, доки не підключите Steam знову.
          </p>
          <div className="mt-4 flex justify-between gap-2">
            <Button type="button" variant="outline" disabled={model.loader.isLoading} onClick={() => model.modal.close()}>
              Скасувати
            </Button>
            <Button type="button" variant="destructive" disabled={model.loader.isLoading} onClick={handleConfirm}>
              Відв&apos;язати
            </Button>
          </div>
        </Preloader>
      </DialogContent>
    </Dialog>
  );
});

export { DisconnectSteamModal };
