import { ServerInfo } from '@/features/server-info';

import { Button } from '@/shared/ui/atoms/button';
import { Link } from '@/shared/ui/atoms/link';
import classNames from 'classnames';
import Image from 'next/image';
import { FC } from 'react';

const LogoAndTitle: FC<{
  size?: 'md' | 'lg';
}> = ({ size = 'md' }) => (
  <div
    className={classNames(
      'relative flex flex-col items-center justify-center',
      {
        'bg-[url("/images/hero.jpg")] bg-no-repeat bg-center bg-cover w-full shadow-2xl':
          size === 'md',
      }
    )}>
    {size === 'md' && (
      <div className='absolute inset-0 bg-black opacity-90 z-10' />
    )}
    <div className='z-10'>
      <Link href='/' className='w-fit block mx-auto hover:scale-105 transition-transform'>
        <Image
          className='mx-auto'
          priority
          src='/images/logo.webp'
          width={size === 'lg' ? 256 : 128}
          height={size === 'lg' ? 256 : 128}
          alt='VTG logo'
        />
      </Link>
      <h1 className='font-bold mb-4 text-center'>
        <span className='tracking-widest font-extrabold text-center text-4xl'>
          VIRTUAL TACTICAL GAMES
        </span>
        <br />
        <span
          className={classNames('font-light text-center', {
            'text-2xl': size === 'lg',
            'text-xl': size === 'md',
          })}>
          Українська Arma III спільнота
        </span>
      </h1>
    </div>
  </div>
);

export const Hero: FC<{
  className?: string;
  variant?: 'default' | 'home';
}> = ({ className, variant = 'default' }) => {
  if (variant === 'default') {
    return (
      <div
        className={classNames(
          'w-full flex justify-center items-center',
          className
        )}>
        <LogoAndTitle />
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'relative flex flex-col items-center justify-center min-h-screen w-full shadow-2xl shadow-black',
        className
      )}>
      <video
        className='absolute inset-0 w-full h-full object-cover z-10 '
        src='/media/hero.webm'
        autoPlay
        muted
        loop
      />
      <div className='absolute inset-0 bg-black opacity-75 z-10'></div>
      <div className='absolute inset-0 z-10 text-white text-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        <LogoAndTitle size='lg' />
        <Button
          size='lg'
          className='uppercase hover:scale-104 transition-transform'>
          Почати грати
        </Button>
        <ServerInfo className='mx-auto mt-12 min-w-[200px]' />
      </div>
    </div>
  );
};
