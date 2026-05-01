'use client';

import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@/shared/ui/atoms/button';
import { LoaderIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from '@/shared/ui/organisms/dialog';
import { DeleteMissionCommentModel } from './model';

type DeleteMissionCommentModalProps = {
  model: DeleteMissionCommentModel;
  onConfirm: (commentId: string) => Promise<void>;
};

export const DeleteMissionCommentModal: FC<DeleteMissionCommentModalProps> = observer(({ model, onConfirm }) => {
  const comment = model.visibility.payload?.comment;

  const handleDelete = async () => {
    if (!comment) return;

    try {
      model.loader.start();
      await onConfirm(comment.id);
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
          <DialogTitle>Видалити коментар?</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-zinc-400">Ця дія незворотна. Коментар буде видалено назавжди.</p>

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
              'Видалити'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
