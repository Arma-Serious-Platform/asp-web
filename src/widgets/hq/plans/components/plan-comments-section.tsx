'use client';

import { observer } from 'mobx-react-lite';

import { CommentList } from '@/entities/comment/ui';
import { CommentViewModel } from '@/entities/comment/types';
import { DeleteMissionCommentModal, DeleteMissionCommentModel } from '@/features/mission/comment/delete-comment';
import { MessageComposer } from '@/features/chat/message-composer/ui';
import { HeadquartersComment, MissionCommentMessage } from '@/shared/sdk/types';
import { LoaderIcon } from 'lucide-react';
import { session } from '@/entities/session/model';

import { HqPlansModel } from '../model';

type PlanCommentsSectionProps = {
  model: HqPlansModel;
  selectedPlanId?: string;
  deleteHqCommentModel: DeleteMissionCommentModel;
  canDeleteHeadquartersComment: (comment: HeadquartersComment) => boolean;
  canEditHeadquartersComment: (comment: HeadquartersComment) => boolean;
};

const toCommentViewModel = (comment: HeadquartersComment): CommentViewModel => ({
  id: comment.id,
  userId: comment.userId,
  message: comment.message,
  updatedAt: comment.updatedAt,
  createdAt: comment.createdAt,
  user: comment.user,
  attachments: comment.attachments,
});

export const PlanCommentsSection = observer(
  ({
    model,
    selectedPlanId,
    deleteHqCommentModel,
    canDeleteHeadquartersComment,
    canEditHeadquartersComment,
  }: PlanCommentsSectionProps) => {
    const comments = model.comments.map(toCommentViewModel);

    return (
      <div className="border-t border-white/10 mt-6 pt-2">
        <h2 className="text-2xl font-bold text-white">Коментарі</h2>

        {model.isCommentsLoading ? (
          <div className="flex items-center justify-center py-6 text-zinc-500">
            <LoaderIcon className="size-4 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-white text-sm py-4 text-center h-10 mb-8">Наразі жодних коментарів немає</div>
        ) : (
          <CommentList
            className="mb-2"
            comments={comments}
            canDeleteComment={comment =>
              canDeleteHeadquartersComment(model.comments.find(item => item.id === comment.id)!)
            }
            canEditComment={comment => canEditHeadquartersComment(model.comments.find(item => item.id === comment.id)!)}
            onDeleteComment={comment => {
              const source = model.comments.find(item => item.id === comment.id);
              if (!source) return;
              deleteHqCommentModel.visibility.open({ comment: source });
            }}
            onEditComment={async (comment, payload) => {
              await model.updateComment(comment.id, payload);
            }}
          />
        )}

        <div className="mb-4">
          {session.isCommunicationMuted && (
            <div className="mb-2 text-xs text-amber-300">
              Вам заборонено писати коментарі на час блокування
              {session.user.user?.bannedUntil
                ? ` до ${new Date(session.user.user.bannedUntil).toLocaleString('uk-UA')}`
                : ''}
              .
            </div>
          )}
          <MessageComposer
            placeholder="Додати коментар..."
            maxCharacters={500}
            disabled={model.isCommentSending || session.isCommunicationMuted}
            onSubmit={async ({ lexicalState, attachments }) => {
              if (!selectedPlanId) return;
              await model.createComment(selectedPlanId, lexicalState as MissionCommentMessage, attachments);
            }}
          />
        </div>
      </div>
    );
  },
);
