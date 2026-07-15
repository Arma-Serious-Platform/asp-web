import toast from 'react-hot-toast';
import {
  attachmentFileTypeLimitMessage,
  isAllowedAttachmentFile,
} from '@/shared/utils/attachment-file-types';

export const MAX_MISSION_UPLOAD_FILE_SIZE_MB = 10;
export const MAX_ATTACHMENT_FILE_SIZE_MB = 10;
export const MAX_UPLOAD_FILE_SIZE_MB = MAX_MISSION_UPLOAD_FILE_SIZE_MB;
export const MAX_UPLOAD_FILE_SIZE_BYTES = MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024;
export const MAX_ATTACHMENT_FILE_SIZE_BYTES = MAX_ATTACHMENT_FILE_SIZE_MB * 1024 * 1024;

export const uploadFileSizeLimitMessage = `Максимальний розмір файлу — ${MAX_UPLOAD_FILE_SIZE_MB} МБ`;
export const attachmentFileSizeLimitMessage = `Максимальний розмір файлу — ${MAX_ATTACHMENT_FILE_SIZE_MB} МБ`;

export const isValidUploadFileSize = (file: File, maxBytes = MAX_UPLOAD_FILE_SIZE_BYTES): boolean =>
  file.size <= maxBytes;

export const isValidAttachmentFileSize = (file: File, maxBytes = MAX_ATTACHMENT_FILE_SIZE_BYTES): boolean =>
  file.size <= maxBytes;

export const rejectOversizedUploadFiles = (files: File[], maxBytes = MAX_UPLOAD_FILE_SIZE_BYTES): { accepted: File[]; rejected: File[] } => {
  const accepted: File[] = [];
  const rejected: File[] = [];

  for (const file of files) {
    if (isValidUploadFileSize(file, maxBytes)) {
      accepted.push(file);
    } else {
      rejected.push(file);
    }
  }

  return { accepted, rejected };
};

export const rejectOversizedAttachmentFiles = (files: File[]): { accepted: File[]; rejected: File[] } =>
  rejectOversizedUploadFiles(files, MAX_ATTACHMENT_FILE_SIZE_BYTES);

export const rejectInvalidAttachmentFiles = (files: File[]): { accepted: File[]; rejected: File[] } => {
  const accepted: File[] = [];
  const rejected: File[] = [];

  for (const file of files) {
    if (isAllowedAttachmentFile(file)) {
      accepted.push(file);
    } else {
      rejected.push(file);
    }
  }

  return { accepted, rejected };
};

export const notifyInvalidAttachmentFiles = (rejected: File[]): void => {
  if (!rejected.length) return;

  if (rejected.length === 1) {
    toast.error(`${rejected[0].name}: недозволений тип файлу. ${attachmentFileTypeLimitMessage}`);
    return;
  }

  toast.error(`${rejected.length} файл(ів) мають недозволений тип. ${attachmentFileTypeLimitMessage}`);
};

export const notifyOversizedAttachmentFiles = (rejected: File[]): void => {
  if (!rejected.length) return;

  if (rejected.length === 1) {
    toast.error(`${rejected[0].name}: ${attachmentFileSizeLimitMessage}`);
    return;
  }

  toast.error(`${rejected.length} файл(ів) перевищують ліміт. ${attachmentFileSizeLimitMessage}`);
};

export const notifyOversizedUploadFiles = (rejected: File[]): void => {
  if (!rejected.length) return;

  if (rejected.length === 1) {
    toast.error(`${rejected[0].name}: ${uploadFileSizeLimitMessage}`);
    return;
  }

  toast.error(`${rejected.length} файл(ів) перевищують ліміт. ${uploadFileSizeLimitMessage}`);
};

export const resolveUploadFileFromInput = (
  file: File | null | undefined,
  input?: HTMLInputElement | null,
): File | null => {
  if (!file) return null;

  if (isValidUploadFileSize(file)) return file;

  toast.error(`${file.name}: ${uploadFileSizeLimitMessage}`);
  if (input) input.value = '';

  return null;
};

export const ensureValidUploadFile = (file: File): boolean => {
  if (isValidUploadFileSize(file)) return true;

  toast.error(`${file.name}: ${uploadFileSizeLimitMessage}`);
  return false;
};

export const base64ToFile = async (base64: string, fileName: string) => {
  const res = await fetch(base64);

  const blob = await res.blob();
  const file = new File([blob], fileName, { type: blob.type });

  return file;
};
