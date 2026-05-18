import toast from 'react-hot-toast';

export const MAX_UPLOAD_FILE_SIZE_MB = 5;
export const MAX_UPLOAD_FILE_SIZE_BYTES = MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024;

export const uploadFileSizeLimitMessage = `Максимальний розмір файлу — ${MAX_UPLOAD_FILE_SIZE_MB} МБ`;

export const isValidUploadFileSize = (file: File, maxBytes = MAX_UPLOAD_FILE_SIZE_BYTES): boolean =>
  file.size <= maxBytes;

export const rejectOversizedUploadFiles = (files: File[]): { accepted: File[]; rejected: File[] } => {
  const accepted: File[] = [];
  const rejected: File[] = [];

  for (const file of files) {
    if (isValidUploadFileSize(file)) {
      accepted.push(file);
    } else {
      rejected.push(file);
    }
  }

  return { accepted, rejected };
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
