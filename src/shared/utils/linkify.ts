export type LinkifyPart =
  | { type: 'text'; value: string }
  | { type: 'link'; value: string; href: string };

const URL_PATTERN = /\b((?:https?:\/\/|www\.)[^\s<>"{}|\\^`[\]]+)/gi;

const trimTrailingPunctuation = (url: string) => {
  const match = url.match(/([.,;:!?)\]]+)$/);
  if (!match) return { url, trailing: '' };

  return {
    url: url.slice(0, -match[1].length),
    trailing: match[1],
  };
};

const toHref = (url: string) => (url.startsWith('www.') ? `https://${url}` : url);

export const linkifyText = (text: string): LinkifyPart[] => {
  const parts: LinkifyPart[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const rawUrl = match[1];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, index) });
    }

    const { url, trailing } = trimTrailingPunctuation(rawUrl);

    if (url) {
      parts.push({ type: 'link', value: url, href: toHref(url) });
    }

    if (trailing) {
      parts.push({ type: 'text', value: trailing });
    }

    lastIndex = index + rawUrl.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts.length ? parts : [{ type: 'text', value: text }];
};
