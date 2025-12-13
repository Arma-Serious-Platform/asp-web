import { cn } from '@/shared/utils/cn';
import Image from 'next/image';
import { FC } from 'react';

export const Avatar: FC<{
  src?: string;
  alt?: string;
  size?: 'lg' | 'md' | 'sm';
}> = ({ src = '/images/avatar.jpg', alt = 'avatar', size = 'md' }) => {
  return (
    <div
      className={cn(
        'bg-gray-200 overflow-hidden rounded-full relative',
        size === 'lg' && 'w-12 h-12',
        size === 'md' && 'w-10 h-10',
        size === 'sm' && 'w-8 h-8'
      )}>
      <Image src={src} alt={alt} className='size-auto' width={40} height={40} />
    </div>
  );
};
