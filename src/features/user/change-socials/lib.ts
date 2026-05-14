export type SocialKeys = 'telegramUrl' | 'discordUrl' | 'twitchUrl' | 'youtubeUrl';

const TELEGRAM_HOSTS = new Set(['t.me', 'telegram.me', 'telegram.dog']);
const DISCORD_HOSTS = new Set(['discord.gg', 'discord.com', 'www.discord.com']);
const TWITCH_HOSTS = new Set(['twitch.tv', 'www.twitch.tv', 'm.twitch.tv']);
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
};

const DOMAIN_HINT: Record<SocialKeys, string> = {
  telegramUrl: 't.me, telegram.me',
  discordUrl: 'discord.gg, discord.com',
  twitchUrl: 'twitch.tv',
  youtubeUrl: 'youtube.com, youtu.be',
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

/** Returns an error message in Ukrainian, or `null` if the value is empty or valid. */
export function validateSocialUrl(key: SocialKeys, raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;

  const url = parseSocialUrl(t);
  if (!url) {
    return 'Введіть коректне посилання';
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return 'Дозволені лише посилання http або https';
  }

  const host = url.hostname.toLowerCase();
  const allowed = ALLOWED_HOSTS[key];
  if (!allowed.has(host)) {
    return `Очікується домен: ${DOMAIN_HINT[key]}`;
  }

  return null;
}
