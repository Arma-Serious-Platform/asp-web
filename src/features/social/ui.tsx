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
  size?: number;
}> = ({ className, size = 24 }) => {
  return (
    <div className={cn('flex gap-6', className)}>
      {socials.map((social) => (
        <a
          key={social.alt}
          href={social.href}
          target='_blank'
          rel='noopener noreferrer'
          className='hover:scale-110 transition-transform'>
          <Image src={social.src} alt={social.alt} width={size} height={size} />
        </a>
      ))}
    </div>
  );
};

export { Social };
