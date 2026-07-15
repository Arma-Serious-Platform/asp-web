'use client';

import { observer } from 'mobx-react-lite';

import { MessageContent } from '@/entities/comment/lexical-message';
import { MessageAttachments } from '@/entities/attachment/ui/message-attachments';
import { UserNicknameText } from '@/entities/user/ui/user-text';
import { DeleteMissionCommentModal, DeleteMissionCommentModel } from '@/features/mission/comment/delete-comment';
import { MessageComposer } from '@/features/chat/message-composer/ui';
import { HeadquartersComment, MissionCommentMessage, User } from '@/shared/sdk/types';
import { Avatar } from '@/shared/ui/organisms/avatar';
import { Button } from '@/shared/ui/atoms/button';
import dayjs from 'dayjs';
import { LoaderIcon, TrashIcon } from 'lucide-react';

import { HqPlansModel } from '../model';

type PlanCommentsSectionProps = {
  model: HqPlansModel;
  selectedPlanId?: string;
  deleteHqCommentModel: DeleteMissionCommentModel;
  canDeleteHeadquartersComment: (comment: HeadquartersComment) => boolean;
};

export const PlanCommentsSection = observer(
  ({ model, selectedPlanId, deleteHqCommentModel, canDeleteHeadquartersComment }: PlanCommentsSectionProps) => {
    return (
      <div className="rounded-lg border border-white/10 bg-black/20 p-3">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Коментарі</div>

        {model.isCommentsLoading ? (
          <div className="flex items-center justify-center py-6 text-zinc-500">
            <LoaderIcon className="size-4 animate-spin" />
          </div>
        ) : model.comments.length === 0 ? (
          <div className="mb-3 text-sm text-zinc-500">Ще немає коментарів</div>
        ) : (
          <ul className="mb-3 flex flex-col gap-2">
            {model.comments.map(comment => (
              <li key={comment.id} className="rounded-md border border-white/10 bg-black/30 p-2">
                <div className="mb-1 flex items-start gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Avatar
                      size="sm"
                      toProfileId={comment.user?.id}
                      src={comment.user?.avatar?.url ?? undefined}
                      alt={comment.user?.nickname ?? ''}
                    />
                    {comment.user ? (
                      <UserNicknameText user={comment.user as User} />
                    ) : (
                      <span className="text-sm text-zinc-300">Користувач</span>
                    )}
                    <span className="text-xs text-zinc-500">{dayjs(comment.createdAt).format('DD.MM.YYYY HH:mm')}</span>
                  </div>
                  {canDeleteHeadquartersComment(comment) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0 px-2"
                      title="Видалити коментар"
                      aria-label="Видалити коментар"
                      onClick={() => deleteHqCommentModel.visibility.open({ comment })}>
                      <TrashIcon className="size-4 text-red-400" />
                    </Button>
                  )}
                </div>
                <MessageContent message={comment.message as MissionCommentMessage} />
                <MessageAttachments attachments={comment.attachments} />
              </li>
            ))}
          </ul>
        )}

        <MessageComposer
          placeholder="Написати коментар..."
          maxCharacters={500}
          disabled={model.isCommentSending}
          onSubmit={async ({ lexicalState, attachments }) => {
            if (!selectedPlanId) return;
            await model.createComment(selectedPlanId, lexicalState as MissionCommentMessage, attachments);
          }}
        />
      </div>
    );
  },
);
