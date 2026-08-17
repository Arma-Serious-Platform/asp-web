'use client';

import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@/shared/ui/atoms/button';
import { LoaderIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from '@/shared/ui/organisms/dialog';
import { DeleteMissionState } from '../state/delete-mission.state';

type DeleteMissionModalProps = {
  state: DeleteMissionState;
  model?: DeleteMissionState;
  onConfirm: (missionId: string) => Promise<void>;
};

export const DeleteMissionModal: FC<DeleteMissionModalProps> = observer(({ state: stateProp, model, onConfirm }) => {
  const state = stateProp ?? model!;
  const payload = state.visibility.payload;

  const handleDelete = async () => {
    if (!payload) return;

    try {
      state.loader.start();
      await onConfirm(payload.missionId);
      state.visibility.close();
    } finally {
      state.loader.stop();
    }
  };

  return (
    <Dialog open={state.visibility.isOpen} onOpenChange={state.visibility.switch}>
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
          <Button variant="outline" onClick={() => state.visibility.close()} disabled={state.loader.isLoading}>
            Скасувати
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={state.loader.isLoading}>
            {state.loader.isLoading ? (
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
