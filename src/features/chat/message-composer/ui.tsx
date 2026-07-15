'use client';

import { FC, useRef, useState } from 'react';
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

export type MessageComposerSubmitPayload = MessageEditorSubmitPayload & {
  attachments: File[];
};

type MessageComposerProps = Omit<MessageEditorProps, 'onSubmit' | 'toolbarExtra' | 'composerFooter'> & {
  onSubmit?: (payload: MessageComposerSubmitPayload) => void | Promise<void>;
  className?: string;
};

export const MessageComposer: FC<MessageComposerProps> = ({
  onSubmit,
  className,
  disabled,
  ...editorProps
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

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
          <AttachmentDraftPreview files={attachments} onRemove={removeAttachment} />
        }
        onSubmit={async payload => {
          if (!payload.text.trim() && attachments.length === 0) return;
          await onSubmit?.({
            ...payload,
            attachments,
          });
          setAttachments([]);
        }}
      />
    </div>
  );
};
