'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Card } from '@/shared/ui/atoms/card';
import { Preloader } from '@/shared/ui/atoms/preloader';
import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { AcceptOrRejectInviteModel, acceptOrRejectInviteModel } from './model';
import { SquadInvitation } from '@/shared/sdk/types';
import Image from 'next/image';
import { CheckIcon, XIcon } from 'lucide-react';

const SquadInviteItem: FC<{
  invitation: SquadInvitation;
  model: AcceptOrRejectInviteModel;
  onAccept?: (invitation: SquadInvitation) => void;
  onReject?: (invitation: SquadInvitation) => void;
}> = observer(({ invitation, model, onAccept, onReject }) => {
  const handleAccept = () => {
    model.acceptInvitation(invitation.id, onAccept);
  };

  const handleReject = () => {
    model.rejectInvitation(invitation.id, onReject);
  };

  const isPending = invitation.status === 'PENDING';

  return (
    <Card className='flex gap-3 items-center !p-3'>
      <div className='overflow-hidden rounded-lg border border-white/10 bg-black/70 flex-shrink-0'>
        <Image
          src={invitation.squad.logo?.url || '/images/logo.webp'}
          alt={invitation.squad.name}
          width={64}
          height={64}
          className='h-16 w-16 object-cover'
        />
      </div>

      <div className='flex-1 flex flex-col gap-1 min-w-0'>
        <div className='text-sm font-semibold text-white truncate'>
          {invitation.squad.name}
        </div>
        {invitation.squad.tag && (
          <div className='inline-flex w-fit items-center rounded-full border border-white/15 bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-200'>
            {invitation.squad.tag}
          </div>
        )}
        {invitation.squad.description && (
          <p className='text-xs text-zinc-400 line-clamp-2'>
            {invitation.squad.description}
          </p>
        )}
      </div>

      {isPending && (
        <div className='flex gap-2 flex-shrink-0'>
          <Button
            size='sm'
            variant='default'
            onClick={handleAccept}
            disabled={model.loader.isLoading}
            className='h-8 px-3'>
            <CheckIcon className='size-4' />
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={handleReject}
            disabled={model.loader.isLoading}
            className='h-8 px-3'>
            <XIcon className='size-4' />
          </Button>
        </div>
      )}

      {!isPending && (
        <div className='text-xs text-zinc-500 uppercase tracking-[0.1em]'>
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
  onAccept?: (invitation: SquadInvitation) => void;
  onReject?: (invitation: SquadInvitation) => void;
}> = observer(
  ({
    invitations,
    model = acceptOrRejectInviteModel,
    onAccept,
    onReject,
  }) => {
    const pendingInvites = invitations.filter(
      (inv) => inv.status === 'PENDING'
    );

    if (pendingInvites.length === 0) {
      return null;
    }

    return (
      <div className='flex flex-col gap-2'>
        <span className='text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500'>
          Запрошення до загонів ({pendingInvites.length})
        </span>
        <Preloader isLoading={model.loader.isLoading}>
          <div className='flex flex-col gap-2'>
            {pendingInvites.map((invitation) => (
              <SquadInviteItem
                key={invitation.id}
                invitation={invitation}
                model={model}
                onAccept={onAccept}
                onReject={onReject}
              />
            ))}
          </div>
        </Preloader>
      </div>
    );
  }
);

