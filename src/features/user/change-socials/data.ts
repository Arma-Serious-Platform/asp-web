import { SocialKeys } from './lib';

export const socialsConfig: {
  key: SocialKeys;
  label: string;
  placeholder: string;
  icon: string;
}[] = [
  {
    key: 'telegramUrl',
    label: 'Telegram',
    placeholder: 'username або channel',
    icon: '/images/social/telegram.svg',
  },
  {
    key: 'discordUrl',
    label: 'Discord',
    placeholder: 'invite-code або users/...',
    icon: '/images/social/discord.svg',
  },
  {
    key: 'twitchUrl',
    label: 'Twitch',
    placeholder: 'channel',
    icon: '/images/social/twitch.svg',
  },
  {
    key: 'youtubeUrl',
    label: 'YouTube',
    placeholder: '@channel або channel/...',
    icon: '/images/social/youtube.svg',
  },
  {
    key: 'tiktokUrl',
    label: 'TikTok',
    placeholder: '@profile',
    icon: '/images/social/tiktok.svg',
  },
];
