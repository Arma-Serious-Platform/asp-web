'use client';

import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { LoaderIcon } from 'lucide-react';

import { State } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from '@/shared/ui/organisms/dialog';
import { ChangeMissionStateState } from '../state/change-mission-state.state';

type ChangeMissionStateModalProps = {
  state: ChangeMissionStateState;
  model?: ChangeMissionStateState;
  onSuccess?: (state: State) => void | Promise<void>;
};

export const ChangeMissionStateModal: FC<ChangeMissionStateModalProps> = observer(
  ({ state: stateProp, model, onSuccess }) => {
    const state = stateProp ?? model!;
    const payload = state.visibility.payload;
  const isArchiveAction = payload?.state === State.ARCHIVED;

  return (
    <Dialog open={state.visibility.isOpen} onOpenChange={state.visibility.switch}>
      <DialogOverlay />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isArchiveAction ? 'Архівувати місію?' : 'Розархівувати місію?'}</DialogTitle>
        </DialogHeader>

        {payload && (
          <p className="text-sm text-zinc-400">
            {isArchiveAction ? (
              <>
                Місія «<span className="font-medium text-zinc-200">{payload.mission.name}</span>» буде архівована.
                Після цього створення та редагування її версій буде недоступним.
              </>
            ) : (
              <>
                Місія «<span className="font-medium text-zinc-200">{payload.mission.name}</span>» буде повернена в
                активний стан. Після цього версії знову можна буде створювати та редагувати.
              </>
            )}
          </p>
        )}

        <div className="mt-4 flex justify-between gap-2">
          <Button variant="outline" disabled={state.loader.isLoading} onClick={() => state.visibility.close()}>
            Скасувати
          </Button>
          <Button
            variant={isArchiveAction ? 'destructive' : 'default'}
            disabled={state.loader.isLoading || !payload}
            onClick={() => state.changeState(onSuccess)}>
            {state.loader.isLoading ? (
              <>
                <LoaderIcon className="size-4 animate-spin" />
                Збереження...
              </>
            ) : isArchiveAction ? (
              'Архівувати'
            ) : (
              'Розархівувати'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
