'use client';

import { FC, useState } from 'react';
import toast from 'react-hot-toast';
import { LoaderIcon, SendIcon } from 'lucide-react';

import { session } from '@/entities/session/model';
import { api } from '@/shared/sdk';
import { Squad, SquadJoinRequest } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';

type RequestToJoinSquadButtonProps = {
  squad: Squad;
  pendingRequest?: SquadJoinRequest | null;
  onRequestCreated?: (request: SquadJoinRequest) => void | Promise<void>;
  className?: string;
};

export const RequestToJoinSquadButton: FC<RequestToJoinSquadButtonProps> = ({
  squad,
  pendingRequest,
  onRequestCreated,
  className,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = session.user?.user;
  const canRequest = Boolean(session.isAuthorized && currentUser && !currentUser.squad);
  const isRecruitingClosed = squad.recruiting === false;
  const isPending = pendingRequest?.status === 'PENDING';

  if (!canRequest) return null;

  const handleRequest = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.requestToJoinSquad(squad.id);

      toast.success('Заявку на вступ відправлено');
      await onRequestCreated?.(data);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Не вдалося відправити заявку';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      variant={isPending || isRecruitingClosed ? 'secondary' : 'default'}
      disabled={isLoading || isPending || isRecruitingClosed}
      className={className}
      onClick={handleRequest}>
      {isLoading ? (
        <LoaderIcon className="size-4 animate-spin" />
      ) : (
        <SendIcon className="size-4" />
      )}
      {isPending ? 'Заявку відправлено' : isRecruitingClosed ? 'Набір закрито' : 'Подати заявку'}
    </Button>
  );
};
