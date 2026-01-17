import { cn } from '@/shared/utils/cn';
import Image from 'next/image';
import { FC } from 'react';

const socials = [
  {
    href: 'https://discord.gg/DcWXHAR5XV',
    src: '/images/social/discord.svg',
    alt: 'Discord',
  },
  {
    href: 'https://www.tiktok.com/@virtual_tactical_games',
    src: '/images/social/tiktok.svg',
    alt: 'TikTok',
  },
  {
    href: 'https://www.youtube.com/@vtgarmaua',
    src: '/images/social/youtube.svg',
    alt: 'YouTube',
  },
  {
    href: 'https://t.me/armaVTG',
    src: '/images/social/telegram.svg',
    alt: 'Telegram',
  },
];

const Social: FC<{
  className?: string;
  iconClassName?: string;
}> = ({ className, iconClassName = 'size-6' }) => {
  return (
    <div className={cn('flex gap-6', className)}>
      {socials.map(social => (
        <a
          key={social.alt}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-110 transition-transform">
          <Image src={social.src} alt={social.alt} width={24} height={24} className={iconClassName} />
        </a>
      ))}
    </div>
  );
};

export { Social };
