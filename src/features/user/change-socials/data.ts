import { SocialKeys } from "./lib";

export const socialsConfig: {
  key: SocialKeys;
  label: string;
  placeholder: string;
  icon: string;
}[] = [
    {
      key: 'telegramUrl',
      label: 'Telegram',
      placeholder: 'https://t.me/...',
      icon: '/images/social/telegram.svg',
    },
    {
      key: 'discordUrl',
      label: 'Discord',
      placeholder: 'https://discord.gg/...',
      icon: '/images/social/discord.svg',
    },
    {
      key: 'twitchUrl',
      label: 'Twitch',
      placeholder: 'https://twitch.tv/...',
      icon: '/images/social/twitch.svg',
    },
    {
      key: 'youtubeUrl',
      label: 'YouTube',
      placeholder: 'https://youtube.com/...',
      icon: '/images/social/youtube.svg',
    },
  ];