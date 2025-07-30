import Image from 'next/image';
import { FC } from 'react';

export const Avatar: FC<{
  src?: string;
  alt?: string;
}> = ({ src = '/images/avatar.jpg', alt = 'avatar' }) => {
  return (
    <div className='w-10 h-10 bg-gray-200 overflow-hidden rounded-full'>
      <Image src={src} alt={alt} width={40} height={40} />
    </div>
  );
};
