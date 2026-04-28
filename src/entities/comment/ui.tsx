'use client';

import { Avatar } from '@/shared/ui/organisms/avatar';
import { cn } from '@/shared/utils/cn';
import { FC } from 'react';
import { UserNicknameText } from '../user/ui/user-text';
import { MissionComment } from '@/shared/sdk/types';
import dayjs from 'dayjs';
import { MessageContent } from './lexical-message';
import { Button } from '@/shared/ui/atoms/button';
import { TrashIcon } from 'lucide-react';

export type CommentItemProps = {
  className?: string;
  canDelete?: boolean;
  onDelete?: (comment: MissionComment) => void;
} & MissionComment;

export const CommentItem: FC<CommentItemProps> = props => {
  const { user, message, updatedAt, className, canDelete, onDelete } = props;

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
        <div className="mt-1">
          <MessageContent message={message} />
        </div>
      </div>
      {canDelete && onDelete && (
        <div className="shrink-0 self-start">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete(props)}>
            <TrashIcon className="size-4 text-red-400" />
          </Button>
        </div>
      )}
    </article>
  );
};

export type CommentListProps = {
  comments: MissionComment[];
  className?: string;
  canDeleteComment?: (comment: MissionComment) => boolean;
  onDeleteComment?: (comment: MissionComment) => void;
};

export const CommentList: FC<CommentListProps> = ({ comments, className, canDeleteComment, onDeleteComment }) => {
  return (
    <ul className={cn('flex flex-col gap-2', className)}>
      {comments.map(comment => (
        <li key={comment.id}>
          <CommentItem
            {...comment}
            canDelete={canDeleteComment?.(comment)}
            onDelete={onDeleteComment}
          />
        </li>
      ))}
    </ul>
  );
};
