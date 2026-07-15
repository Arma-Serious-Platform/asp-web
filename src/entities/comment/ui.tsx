'use client';

import { Avatar } from '@/shared/ui/organisms/avatar';
import { cn } from '@/shared/utils/cn';
import { FC, useState } from 'react';
import { UserNicknameText } from '../user/ui/user-text';
import dayjs from 'dayjs';
import { MessageContent } from './lexical-message';
import { MessageAttachments } from '@/entities/attachment/ui/message-attachments';
import { Button } from '@/shared/ui/atoms/button';
import { PencilIcon, TrashIcon } from 'lucide-react';
import { CommentViewModel } from './types';
import { MessageComposer, MessageComposerSubmitPayload } from '@/features/chat/message-composer/ui';

export type CommentItemProps = {
  className?: string;
  canDelete?: boolean;
  canEdit?: boolean;
  onDelete?: (comment: CommentViewModel) => void;
  onEdit?: (comment: CommentViewModel, payload: MessageComposerSubmitPayload) => void | Promise<void>;
} & CommentViewModel;

export const CommentItem: FC<CommentItemProps> = props => {
  const { user, message, updatedAt, className, canDelete, canEdit, onDelete, onEdit, attachments } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (isEditing) {
    return (
      <article className={cn('w-full rounded-md bg-black/20 px-4 py-3', className)} role="comment">
        <MessageComposer
          editingKey={props.id}
          initialState={message}
          existingAttachments={attachments}
          submitLabel="Зберегти"
          clearOnSubmit={false}
          disabled={isSaving}
          showCancel
          onCancel={() => setIsEditing(false)}
          onSubmit={async payload => {
            if (!onEdit) return;
            setIsSaving(true);
            try {
              await onEdit(props, payload);
              setIsEditing(false);
            } finally {
              setIsSaving(false);
            }
          }}
        />
      </article>
    );
  }

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
          <MessageAttachments attachments={attachments} />
        </div>
      </div>
      {(canEdit || canDelete) && (
        <div className="flex shrink-0 self-start gap-1">
          {canEdit && onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setIsEditing(true)}
              aria-label="Редагувати коментар"
              title="Редагувати коментар">
              <PencilIcon className="size-4 text-zinc-300" />
            </Button>
          )}
          {canDelete && onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDelete(props)}
              aria-label="Видалити коментар"
              title="Видалити коментар">
              <TrashIcon className="size-4 text-red-400" />
            </Button>
          )}
        </div>
      )}
    </article>
  );
};

export type CommentListProps = {
  comments: CommentViewModel[];
  className?: string;
  canDeleteComment?: (comment: CommentViewModel) => boolean;
  canEditComment?: (comment: CommentViewModel) => boolean;
  onDeleteComment?: (comment: CommentViewModel) => void;
  onEditComment?: (comment: CommentViewModel, payload: MessageComposerSubmitPayload) => void | Promise<void>;
};

export const CommentList: FC<CommentListProps> = ({
  comments,
  className,
  canDeleteComment,
  canEditComment,
  onDeleteComment,
  onEditComment,
}) => {
  return (
    <ul className={cn('flex flex-col gap-2', className)}>
      {comments.map(comment => (
        <li key={comment.id}>
          <CommentItem
            {...comment}
            canDelete={canDeleteComment?.(comment)}
            canEdit={canEditComment?.(comment)}
            onDelete={onDeleteComment}
            onEdit={onEditComment}
          />
        </li>
      ))}
    </ul>
  );
};
