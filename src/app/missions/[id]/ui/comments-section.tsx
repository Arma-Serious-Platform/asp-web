'use client';

import { FC } from 'react';
import { CommentList } from '@/entities/comment';
import { LoaderIcon } from 'lucide-react';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import type { CommentViewModel } from '@/entities/comment/types';
import { MessageComposer, MessageComposerSubmitPayload } from '@/features/chat/message-composer/message-composer';
import { View } from '@/features/view';
import { session } from '@/entities/session/session.state';
import { MissionCommentsState } from '@/app/missions/[id]/state/mission-comments.state';

type CommentsSectionProps = {
  missionId: string;
  commentModel: MissionCommentsState;
  canDeleteComment: (comment: CommentViewModel) => boolean;
  canEditComment: (comment: CommentViewModel) => boolean;
  onDeleteComment: (comment: CommentViewModel) => void;
  onEditComment: (comment: CommentViewModel, payload: MessageComposerSubmitPayload) => Promise<void>;
};

export const CommentsSection: FC<CommentsSectionProps> = observer(
  ({ missionId, commentModel, canDeleteComment, canEditComment, onDeleteComment, onEditComment }) => {
    return (
      <div className="mt-6 border-t border-white/10 pt-2">
        <h2 className="text-2xl font-bold text-white">Коментарі</h2>

        {commentModel.pagination.loader.isLoading && commentModel.pagination.data.length === 0 ? (
          <p className="text-sm text-zinc-500">
            <LoaderIcon className="flex size-4 animate-spin items-center justify-center" />
          </p>
        ) : commentModel.pagination.data.length === 0 ? (
          <div className="mb-8 h-10 py-4 text-center text-sm text-white">Наразі жодних коментарів немає</div>
        ) : (
          <CommentList
            className="mb-2"
            comments={commentModel.pagination.data.map(comment => comment.data as CommentViewModel)}
            canDeleteComment={canDeleteComment}
            canEditComment={canEditComment}
            onDeleteComment={onDeleteComment}
            onEditComment={onEditComment}
          />
        )}

        <View.Condition if={session.isAuthorized}>
          <div className="mb-4">
            {session.isCommunicationMuted && (
              <div className="mb-2 text-xs text-amber-300">
                Вам заборонено писати коментарі на час блокування
                {session.user?.data?.bannedUntil
                  ? ` до ${dayjs(session.user?.data.bannedUntil).format('DD.MM.YYYY HH:mm')}`
                  : ''}
                .
              </div>
            )}
            <MessageComposer
              placeholder="Додати коментар..."
              disabled={session.isCommunicationMuted}
              onSubmit={async ({ lexicalState, attachments }) => {
                await commentModel.create(missionId, lexicalState, attachments);
              }}
            />
          </div>
        </View.Condition>
      </div>
    );
  },
);
