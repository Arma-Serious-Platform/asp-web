'use client';

import { FC, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { CheckIcon, LoaderIcon, XIcon } from 'lucide-react';

import { UserNicknameText } from '@/entities/user/ui/user-text';
import { SquadJoinRequest } from '@/shared/sdk/types';
import { Avatar } from '@/shared/ui/organisms/avatar';
import { Button } from '@/shared/ui/atoms/button';
import { Card } from '@/shared/ui/atoms/card';
import { Preloader } from '@/shared/ui/atoms/preloader';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from '@/shared/ui/organisms/dialog';
import { SquadJoinRequestsModel } from './model';

const SquadJoinRequestConfirmModal: FC<{
  model: SquadJoinRequestsModel;
  onChanged?: () => void | Promise<void>;
}> = observer(({ model, onChanged }) => {
  const payload = model.confirmVisibility.payload;
  const isAccept = payload?.action === 'accept';
  const userName = payload?.request.user.nickname;

  const handleConfirm = async () => {
    if (!payload) return;

    const onSuccess = async () => {
      await onChanged?.();
      model.confirmVisibility.close();
    };

    if (payload.action === 'accept') {
      await model.acceptRequest(payload.request.id, onSuccess);
    } else {
      await model.rejectRequest(payload.request.id, onSuccess);
    }
  };

  return (
    <Dialog open={model.confirmVisibility.isOpen} onOpenChange={model.confirmVisibility.switch}>
      <DialogOverlay />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isAccept ? 'Прийняти заявку?' : 'Відхилити заявку?'}</DialogTitle>
        </DialogHeader>

        {payload && (
          <p className="text-sm text-zinc-400">
            {isAccept ? (
              <>
                Користувач <span className="font-medium text-zinc-200">{userName}</span> приєднається до вашого
                загону.
              </>
            ) : (
              <>
                Заявку користувача <span className="font-medium text-zinc-200">{userName}</span> буде відхилено.
              </>
            )}
          </p>
        )}

        <div className="mt-4 flex justify-between">
          <Button variant="outline" onClick={() => model.confirmVisibility.close()} disabled={model.actionLoader.isLoading}>
            Скасувати
          </Button>
          <Button variant={isAccept ? 'default' : 'destructive'} onClick={handleConfirm} disabled={model.actionLoader.isLoading}>
            {model.actionLoader.isLoading ? (
              <>
                <LoaderIcon className="size-4 animate-spin" />
                {isAccept ? 'Прийняття...' : 'Відхилення...'}
              </>
            ) : isAccept ? (
              'Прийняти'
            ) : (
              'Відхилити'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

const SquadJoinRequestItem: FC<{
  request: SquadJoinRequest;
  model: SquadJoinRequestsModel;
}> = observer(({ request, model }) => (
  <Card className="flex items-center gap-3 p-3!">
    <Avatar src={request.user.avatar?.url} alt={request.user.nickname} size="md" />
    <div className="min-w-0 flex-1">
      <UserNicknameText user={request.user} className="text-sm font-semibold text-zinc-100" />
      <div className="text-xs text-zinc-500">Хоче приєднатися до загону</div>
    </div>
    <div className="flex shrink-0 gap-2">
      <Button
        size="sm"
        variant="default"
        aria-label="Прийняти заявку"
        disabled={model.actionLoader.isLoading}
        onClick={() => model.confirmVisibility.open({ request, action: 'accept' })}>
        <CheckIcon className="size-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        aria-label="Відхилити заявку"
        disabled={model.actionLoader.isLoading}
        onClick={() => model.confirmVisibility.open({ request, action: 'reject' })}>
        <XIcon className="size-4" />
      </Button>
    </div>
  </Card>
));

export const SquadJoinRequestList: FC<{
  model: SquadJoinRequestsModel;
  onChanged?: () => void | Promise<void>;
}> = observer(({ model, onChanged }) => {
  useEffect(() => {
    void model.load();
  }, [model]);

  const pendingRequests = model.requests.filter(request => request.status === 'PENDING');

  return (
    <>
      <SquadJoinRequestConfirmModal model={model} onChanged={onChanged} />
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-semibold text-white">Заявки на вступ</div>
          <p className="text-xs text-zinc-500">Користувачі без загону, які хочуть приєднатися до вашого загону.</p>
        </div>

        <Preloader isLoading={model.loader.isLoading}>
          {pendingRequests.length ? (
            <div className="flex flex-col gap-2">
              {pendingRequests.map(request => (
                <SquadJoinRequestItem key={request.id} request={request} model={model} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-white/10 bg-black/30 p-4 text-sm text-zinc-500">
              Активних заявок немає.
            </div>
          )}
        </Preloader>
      </div>
    </>
  );
});
