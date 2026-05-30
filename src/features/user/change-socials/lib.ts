export type SocialKeys = 'telegramUrl' | 'discordUrl' | 'twitchUrl' | 'youtubeUrl' | 'tiktokUrl';

const TELEGRAM_HOSTS = new Set(['t.me', 'telegram.me', 'telegram.dog']);
const DISCORD_HOSTS = new Set(['discord.gg', 'discord.com', 'www.discord.com']);
const TWITCH_HOSTS = new Set(['twitch.tv', 'www.twitch.tv', 'm.twitch.tv']);
const TIKTOK_HOSTS = new Set(['tiktok.com', 'www.tiktok.com', 'm.tiktok.com']);
const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'music.youtube.com',
  'www.youtube-nocookie.com',
]);

const ALLOWED_HOSTS: Record<SocialKeys, ReadonlySet<string>> = {
  telegramUrl: TELEGRAM_HOSTS,
  discordUrl: DISCORD_HOSTS,
  twitchUrl: TWITCH_HOSTS,
  youtubeUrl: YOUTUBE_HOSTS,
  tiktokUrl: TIKTOK_HOSTS,
};

const DOMAIN_HINT: Record<SocialKeys, string> = {
  telegramUrl: 't.me, telegram.me',
  discordUrl: 'discord.gg, discord.com',
  twitchUrl: 'twitch.tv',
  youtubeUrl: 'youtube.com, youtu.be',
  tiktokUrl: 'tiktok.com',
};

function parseSocialUrl(raw: string): URL | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    return new URL(t);
  } catch {
    try {
      return new URL(`https://${t}`);
    } catch {
      return null;
    }
  }
}

export function getSocialProfileValue(key: SocialKeys, raw?: string | null): string {
  const value = raw?.trim() ?? '';
  if (!value) return '';

  const url = parseSocialUrl(value);
  const allowedHosts = ALLOWED_HOSTS[key];

  if (!url || !allowedHosts.has(url.hostname.toLowerCase())) {
    return value;
  }

  return `${url.pathname}${url.search}${url.hash}`.replace(/^\/+/, '');
}

export function buildSocialUrl(key: SocialKeys, raw: string): string {
  const value = raw.trim().replace(/^\/+/, '');
  if (!value) return '';

  switch (key) {
    case 'telegramUrl':
      return `https://t.me/${value.replace(/^@+/, '')}`;
    case 'discordUrl':
      if (/^(invite|users|channels)\//i.test(value)) {
        return `https://discord.com/${value}`;
      }

      return `https://discord.gg/${value}`;
    case 'twitchUrl':
      return `https://www.twitch.tv/${value.replace(/^@+/, '')}`;
    case 'youtubeUrl':
      return `https://www.youtube.com/${value}`;
    case 'tiktokUrl':
      return `https://www.tiktok.com/${value.startsWith('@') ? value : `@${value}`}`;
  }
}

/** Returns an error message in Ukrainian, or `null` if the value is empty or valid. */
export function validateSocialProfileValue(key: SocialKeys, raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;

  const url = parseSocialUrl(t);
  if (url && ALLOWED_HOSTS[key].has(url.hostname.toLowerCase())) {
    return `Введіть лише нікнейм або частину профілю без домену ${DOMAIN_HINT[key]}`;
  }

  if (/\s/.test(t)) {
    return 'Введіть значення без пробілів';
  }

  if (/^https?:\/\//i.test(t)) {
    return 'Введіть лише нікнейм або частину профілю, не повне посилання';
  }

  return null;
}
