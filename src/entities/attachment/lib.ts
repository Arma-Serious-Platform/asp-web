export type MessageAttachmentItem = {
  id: string;
  originalName: string;
  mimeType?: string | null;
  file?: {
    id: string;
    url: string;
    filename?: string;
  };
};

const IMAGE_MIME_PREFIX = 'image/';
const VIDEO_MIME_PREFIX = 'video/';
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif'] as const;

const getExtension = (value?: string | null) => {
  if (!value) return '';
  const cleanValue = value.split('?')[0];
  const parts = cleanValue.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

export const resolveAttachmentMimeType = (name: string, mimeType?: string | null) => {
  if (mimeType) return mimeType;

  const extension = getExtension(name);
  if (['jpg', 'jpeg'].includes(extension)) return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'gif') return 'image/gif';
  if (extension === 'webp') return 'image/webp';
  if (['mp4', 'webm', 'mov', 'ogg', 'ogv', 'avi', 'mkv', 'm4v'].includes(extension)) {
    return `video/${extension === 'mov' ? 'quicktime' : extension}`;
  }

  return null;
};

export const isImageAttachment = (attachment: MessageAttachmentItem) => {
  const mimeType = resolveAttachmentMimeType(attachment.originalName, attachment.mimeType);
  if (mimeType?.startsWith(IMAGE_MIME_PREFIX)) return true;

  const extension =
    getExtension(attachment.originalName) ||
    getExtension(attachment.file?.url) ||
    getExtension(attachment.file?.filename);

  return IMAGE_EXTENSIONS.includes(extension as (typeof IMAGE_EXTENSIONS)[number]);
};

export const isVideoAttachment = (attachment: MessageAttachmentItem) => {
  if (attachment.mimeType?.startsWith(VIDEO_MIME_PREFIX)) return true;
  const extension = getExtension(attachment.originalName) || getExtension(attachment.file?.url);
  return ['mp4', 'webm', 'mov', 'ogg'].includes(extension);
};

export const isPreviewableAttachment = (attachment: MessageAttachmentItem) =>
  isImageAttachment(attachment) || isVideoAttachment(attachment);

export const getAttachmentUrl = (attachment: MessageAttachmentItem) => attachment.file?.url ?? '';

export const downloadAttachment = (attachment: MessageAttachmentItem) => {
  const url = getAttachmentUrl(attachment);
  if (!url) return;

  const link = document.createElement('a');
  link.href = url;
  link.download = attachment.originalName || attachment.file?.filename || 'attachment';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadFile = (file: File) => {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const isPreviewableUploadFile = (file: File) =>
  isPreviewableAttachment({
    id: file.name,
    originalName: file.name,
    mimeType: resolveAttachmentMimeType(file.name, file.type),
  });

export const normalizeMessageAttachments = (value: unknown): MessageAttachmentItem[] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap(item => {
    if (!item || typeof item !== 'object') return [];

    const record = item as Record<string, unknown>;
    if (typeof record.id !== 'string') return [];

    const fileRecord =
      record.file && typeof record.file === 'object' ? (record.file as Record<string, unknown>) : null;
    const url = typeof fileRecord?.url === 'string' ? fileRecord.url : undefined;

    return [
      {
        id: record.id,
        originalName: typeof record.originalName === 'string' ? record.originalName : 'attachment',
        mimeType: typeof record.mimeType === 'string' ? record.mimeType : null,
        ...(url
          ? {
              file: {
                id: typeof fileRecord?.id === 'string' ? fileRecord.id : record.id,
                url,
                filename: typeof fileRecord?.filename === 'string' ? fileRecord.filename : undefined,
              },
            }
          : {}),
      },
    ];
  });
};
