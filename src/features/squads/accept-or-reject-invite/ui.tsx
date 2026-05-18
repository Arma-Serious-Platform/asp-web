'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Card } from '@/shared/ui/atoms/card';
import { Preloader } from '@/shared/ui/atoms/preloader';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from '@/shared/ui/organisms/dialog';
import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { AcceptOrRejectInviteModel, acceptOrRejectInviteModel } from './model';
import { SquadInvitation } from '@/shared/sdk/types';
import { TextWithLinks } from '@/shared/ui/moleculas/text-with-links';
import { CheckIcon, LoaderIcon, XIcon } from 'lucide-react';

const SquadInviteConfirmModal: FC<{
  model: AcceptOrRejectInviteModel;
  onAccept?: (invitation: SquadInvitation) => void | Promise<void>;
  onReject?: (invitation: SquadInvitation) => void | Promise<void>;
}> = observer(({ model, onAccept, onReject }) => {
  const payload = model.confirmVisibility.payload;
  const isAccept = payload?.action === 'accept';
  const squadName = payload?.invitation.squad.name;

  const handleConfirm = async () => {
    if (!payload) return;

    if (payload.action === 'accept') {
      await model.acceptInvitation(payload.invitation.id, async invitation => {
        await onAccept?.(invitation);
        model.confirmVisibility.close();
      });
    } else {
      await model.rejectInvitation(payload.invitation.id, async invitation => {
        await onReject?.(invitation);
        model.confirmVisibility.close();
      });
    }
  };

  return (
    <Dialog open={model.confirmVisibility.isOpen} onOpenChange={model.confirmVisibility.switch}>
      <DialogOverlay />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isAccept ? 'Прийняти запрошення?' : 'Відхилити запрошення?'}</DialogTitle>
        </DialogHeader>

        {payload && (
          <p className="text-sm text-zinc-400">
            {isAccept ? (
              <>
                Ви приєднаєтесь до загону{' '}
                <span className="font-medium text-zinc-200">{squadName}</span>. Підтвердити прийняття запрошення?
              </>
            ) : (
              <>
                Запрошення до загону <span className="font-medium text-zinc-200">{squadName}</span> буде відхилено.
                Продовжити?
              </>
            )}
          </p>
        )}

        <div className="mt-4 flex justify-between">
          <Button
            variant="outline"
            onClick={() => model.confirmVisibility.close()}
            disabled={model.loader.isLoading}>
            Скасувати
          </Button>
          <Button
            variant={isAccept ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={model.loader.isLoading}>
            {model.loader.isLoading ? (
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

const SquadInviteItem: FC<{
  invitation: SquadInvitation;
  model: AcceptOrRejectInviteModel;
}> = observer(({ invitation, model }) => {
  const isPending = invitation.status === 'PENDING';

  return (
    <Card className="flex gap-3 items-center !p-3">
      <div className="overflow-hidden rounded-lg border border-white/10 bg-black/70 shrink-0">
        <img
          src={invitation.squad.logo?.url || '/images/logo.webp'}
          alt={invitation.squad.name}
          width={64}
          height={64}
          className="h-16 w-16 object-cover"
        />
      </div>

      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">{invitation.squad.name}</div>
        {invitation.squad.tag && (
          <div className="inline-flex w-fit items-center rounded-full border border-white/15 bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-200">
            {invitation.squad.tag}
          </div>
        )}
        {invitation.squad.description && (
          <p className="line-clamp-2 text-xs text-zinc-400">
            <TextWithLinks text={invitation.squad.description} linkClassName="text-primary hover:text-primary/80" />
          </p>
        )}
      </div>

      {isPending && (
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            variant="default"
            onClick={() => model.confirmVisibility.open({ invitation, action: 'accept' })}
            disabled={model.loader.isLoading}
            className="h-8 px-3"
            aria-label="Прийняти запрошення">
            <CheckIcon className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => model.confirmVisibility.open({ invitation, action: 'reject' })}
            disabled={model.loader.isLoading}
            className="h-8 px-3"
            aria-label="Відхилити запрошення">
            <XIcon className="size-4" />
          </Button>
        </div>
      )}

      {!isPending && (
        <div className="text-xs text-zinc-500 uppercase tracking-[0.1em]">
          {invitation.status === 'ACCEPTED' && 'Прийнято'}
          {invitation.status === 'REJECTED' && 'Відхилено'}
        </div>
      )}
    </Card>
  );
});

export const SquadInviteList: FC<{
  invitations: SquadInvitation[];
  model?: AcceptOrRejectInviteModel;
  onAccept?: (invitation: SquadInvitation) => void | Promise<void>;
  onReject?: (invitation: SquadInvitation) => void | Promise<void>;
}> = observer(({ invitations, model = acceptOrRejectInviteModel, onAccept, onReject }) => {
  const pendingInvites = invitations.filter(inv => inv.status === 'PENDING');

  if (pendingInvites.length === 0) {
    return null;
  }

  return (
    <>
      <SquadInviteConfirmModal model={model} onAccept={onAccept} onReject={onReject} />
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
          Запрошення до загонів ({pendingInvites.length})
        </span>
        <Preloader isLoading={model.loader.isLoading}>
          <div className="flex flex-col gap-2">
            {pendingInvites.map(invitation => (
              <SquadInviteItem key={invitation.id} invitation={invitation} model={model} />
            ))}
          </div>
        </Preloader>
      </div>
    </>
  );
});
