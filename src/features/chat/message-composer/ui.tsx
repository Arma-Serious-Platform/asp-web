'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { PaperclipIcon } from 'lucide-react';
import { MessageEditor, MessageEditorProps, MessageEditorSubmitPayload } from '@/features/chat/editor';
import { Button } from '@/shared/ui/atoms/button';
import { ATTACHMENT_FILE_ACCEPT } from '@/shared/utils/attachment-file-types';
import {
  notifyInvalidAttachmentFiles,
  notifyOversizedAttachmentFiles,
  rejectInvalidAttachmentFiles,
  rejectOversizedAttachmentFiles,
} from '@/shared/utils/file';
import { cn } from '@/shared/utils/cn';
import { AttachmentDraftPreview } from '@/entities/attachment/ui/attachment-draft-preview';
import { AttachmentEditPreview } from '@/entities/attachment/ui/attachment-edit-preview';
import { MessageAttachmentItem } from '@/entities/attachment/lib';

export type MessageComposerSubmitPayload = MessageEditorSubmitPayload & {
  attachments: File[];
  removedAttachmentIds: string[];
};

type MessageComposerProps = Omit<MessageEditorProps, 'onSubmit' | 'toolbarExtra' | 'composerFooter'> & {
  onSubmit?: (payload: MessageComposerSubmitPayload) => void | Promise<void>;
  onCancel?: () => void;
  className?: string;
  existingAttachments?: MessageAttachmentItem[];
  editingKey?: string;
  showCancel?: boolean;
};

export const MessageComposer: FC<MessageComposerProps> = ({
  onSubmit,
  onCancel,
  className,
  disabled,
  existingAttachments,
  editingKey,
  showCancel = Boolean(onCancel),
  submitLabel,
  clearOnSubmit = !onCancel,
  ...editorProps
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>([]);
  const isEditMode = Boolean(onCancel);

  useEffect(() => {
    setAttachments([]);
    setRemovedAttachmentIds([]);
  }, [editingKey, editorProps.initialState]);

  const handleAddAttachments = (files: FileList | null) => {
    if (!files?.length) return;

    const selectedFiles = Array.from(files);
    const { accepted: typeAccepted, rejected: typeRejected } = rejectInvalidAttachmentFiles(selectedFiles);
    notifyInvalidAttachmentFiles(typeRejected);

    const { accepted, rejected } = rejectOversizedAttachmentFiles(typeAccepted);
    notifyOversizedAttachmentFiles(rejected);

    if (!accepted.length) return;

    setAttachments(current => [...current, ...accepted]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(current => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const removeExistingAttachment = (attachmentId: string) => {
    setRemovedAttachmentIds(current =>
      current.includes(attachmentId) ? current : [...current, attachmentId],
    );
  };

  const visibleExistingCount =
    existingAttachments?.filter(attachment => !removedAttachmentIds.includes(attachment.id)).length ?? 0;

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ATTACHMENT_FILE_ACCEPT}
        className="hidden"
        onChange={event => {
          handleAddAttachments(event.target.files);
          event.currentTarget.value = '';
        }}
      />

      <MessageEditor
        {...editorProps}
        disabled={disabled}
        allowEmptySubmit
        submitLabel={submitLabel}
        clearOnSubmit={clearOnSubmit}
        toolbarExtra={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Додати вкладення"
            title="Додати вкладення">
            <PaperclipIcon className="size-4" />
          </Button>
        }
        composerFooter={
          isEditMode ? (
            <AttachmentEditPreview
              existingAttachments={existingAttachments}
              removedAttachmentIds={removedAttachmentIds}
              onRemoveExisting={removeExistingAttachment}
              files={attachments}
              onRemoveNew={removeAttachment}
            />
          ) : (
            <AttachmentDraftPreview files={attachments} onRemove={removeAttachment} />
          )
        }
        onSubmit={async payload => {
          const hasContent =
            Boolean(payload.text.trim()) || attachments.length > 0 || visibleExistingCount > 0;

          if (!hasContent) return;

          await onSubmit?.({
            ...payload,
            attachments,
            removedAttachmentIds,
          });

          if (clearOnSubmit) {
            setAttachments([]);
            setRemovedAttachmentIds([]);
          }
        }}
      />

      {showCancel && onCancel && (
        <div className="mt-2 flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={disabled}>
            Скасувати
          </Button>
        </div>
      )}
    </div>
  );
};
