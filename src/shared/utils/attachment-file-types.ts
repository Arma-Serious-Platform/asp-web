export const ATTACHMENT_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'] as const;
export const ATTACHMENT_VIDEO_EXTENSIONS = [
  'mp4',
  'webm',
  'mov',
  'ogg',
  'ogv',
  'avi',
  'mkv',
  'm4v',
  'wmv',
  'flv',
  '3gp',
] as const;
export const ATTACHMENT_AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma', 'opus'] as const;
export const ATTACHMENT_GAME_EXTENSIONS = ['pbo'] as const;
export const ATTACHMENT_TEXT_EXTENSIONS = ['txt', 'sqf', 'sqm'] as const;

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/jpg',
]);

export const ATTACHMENT_FILE_ACCEPT = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/*',
  'audio/*',
  '.pbo',
  '.txt',
  '.sqf',
  '.sqm',
].join(',');

export const attachmentFileTypeLimitMessage =
  'Дозволені формати: відео, фото (JPEG, PNG, GIF, WEBP), аудіо, .pbo, .txt, .sqf, .sqm';

export const getAttachmentFileExtension = (filename: string): string => {
  const cleanValue = filename.split('?')[0];
  const parts = cleanValue.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

export const isAllowedAttachmentExtension = (extension: string): boolean => {
  const ext = extension.toLowerCase();

  return (
    (ATTACHMENT_IMAGE_EXTENSIONS as readonly string[]).includes(ext) ||
    (ATTACHMENT_VIDEO_EXTENSIONS as readonly string[]).includes(ext) ||
    (ATTACHMENT_AUDIO_EXTENSIONS as readonly string[]).includes(ext) ||
    (ATTACHMENT_GAME_EXTENSIONS as readonly string[]).includes(ext) ||
    (ATTACHMENT_TEXT_EXTENSIONS as readonly string[]).includes(ext)
  );
};

export const isAllowedAttachmentFile = (file: Pick<File, 'name' | 'type'>): boolean => {
  if (file.type?.startsWith('video/')) return true;
  if (file.type?.startsWith('audio/')) return true;
  if (file.type && ALLOWED_IMAGE_MIME_TYPES.has(file.type)) return true;
  if (file.type?.startsWith('image/')) return false;
  if (file.type === 'text/plain') return true;

  return isAllowedAttachmentExtension(getAttachmentFileExtension(file.name));
};
