'use client';

import { Avatar } from '@/shared/ui/organisms/avatar';
import { cn } from '@/shared/utils/cn';
import { FC } from 'react';
import { UserNicknameText } from '../user/ui/user-text';
import { MissionComment, MissionCommentMessage } from '@/shared/sdk/types';
import dayjs from 'dayjs';

export type CommentItemProps = {
  className?: string;
} & MissionComment;

function getMessageText(message: MissionCommentMessage): string {
  if (typeof message === 'object' && message !== null && 'text' in message) {
    return String((message as { text?: string }).text ?? '');
  }
  if (typeof message === 'string') return message;
  return '—';
}

export const CommentItem: FC<CommentItemProps> = ({ user, message, updatedAt, className }) => {
  return (
    <article
      className={cn('group flex w-full gap-4 px-4 py-2.5 rounded-md hover:bg-white/[0.02]', className)}
      role="comment">
      <div className="flex shrink-0 pt-0.5">
        <Avatar toProfileId={user?.id} src={user?.avatar?.url ?? undefined} alt={user?.nickname ?? ''} size="md" />
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-base font-semibold text-white">
            {user ? <UserNicknameText user={user} link /> : 'Користувач'}
          </span>
          <span className="text-sm text-zinc-500" title={dayjs(updatedAt).format('DD.MM.YYYY HH:mm')}>
            {dayjs(updatedAt).format('DD.MM.YYYY HH:mm')}
          </span>
        </div>
        <div className="mt-1 break-words text-base text-zinc-300 whitespace-pre-wrap">{getMessageText(message)}</div>
      </div>
    </article>
  );
};

export type CommentListProps = {
  comments: MissionComment[];
  className?: string;
};

export const CommentList: FC<CommentListProps> = ({ comments, className }) => {
  return (
    <ul className={cn('flex flex-col gap-2', className)}>
      {comments.map(comment => (
        <li key={comment.id}>
          <CommentItem {...comment} />
        </li>
      ))}
    </ul>
  );
};
