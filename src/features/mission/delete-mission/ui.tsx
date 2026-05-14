'use client';

import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@/shared/ui/atoms/button';
import { LoaderIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from '@/shared/ui/organisms/dialog';
import { DeleteMissionModel } from './model';

type DeleteMissionModalProps = {
  model: DeleteMissionModel;
  onConfirm: (missionId: string) => Promise<void>;
};

export const DeleteMissionModal: FC<DeleteMissionModalProps> = observer(({ model, onConfirm }) => {
  const payload = model.visibility.payload;

  const handleDelete = async () => {
    if (!payload) return;

    try {
      model.loader.start();
      await onConfirm(payload.missionId);
      model.visibility.close();
    } finally {
      model.loader.stop();
    }
  };

  return (
    <Dialog open={model.visibility.isOpen} onOpenChange={model.visibility.switch}>
      <DialogOverlay />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Видалити місію?</DialogTitle>
        </DialogHeader>

        {payload && (
          <p className="text-sm text-zinc-400">
            Місія «<span className="font-medium text-zinc-200">{payload.missionName}</span>» буде видалена назавжди
            разом із усіма версіями та коментарями. Цю дію неможливо скасувати.
          </p>
        )}

        <div className="mt-4 flex justify-between">
          <Button variant="outline" onClick={() => model.visibility.close()} disabled={model.loader.isLoading}>
            Скасувати
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={model.loader.isLoading}>
            {model.loader.isLoading ? (
              <>
                <LoaderIcon className="size-4 animate-spin" />
                Видалення...
              </>
            ) : (
              'Видалити місію'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
