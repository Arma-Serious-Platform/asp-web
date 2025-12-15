import { ServerInfo } from '@/features/server-info';

import { Button } from '@/shared/ui/atoms/button';
import { Link } from '@/shared/ui/atoms/link';
import classNames from 'classnames';

import { FC } from 'react';

const LogoAndTitle: FC<{
  size?: 'md' | 'lg';
}> = ({ size = 'md' }) => (
  <div
    className={classNames(
      'relative flex flex-col items-center justify-center',
      {
        'bg-[url("/images/hero.jpg")] bg-no-repeat bg-center bg-cover w-full shadow-2xl bg-fixed':
          size === 'md',
      }
    )}>
    {size === 'md' && (
      <div className='absolute inset-0 bg-black opacity-90 z-10' />
    )}
    <div className='z-10'>
      <Link
        href='/'
        className='w-fit block mx-auto hover:scale-105 transition-transform max-w-40 max-md:max-w-36'>
        <img
          className='mx-auto w-full'
          src='/images/logo.webp'
          alt='VTG logo'
        />
      </Link>
      <h1 className='font-bold mb-4 text-center'>
        <span className='tracking-widest font-extrabold text-center text-3xl max-md:text-2xl'>
          VIRTUAL TACTICAL GAMES
        </span>
        <br />
        <span
          className={classNames('font-light text-center max-md:text-xl', {
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
          'w-full flex justify-center items-center paper rounded-none',
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
      <div className='z-20 text-white mx-auto w-full flex flex-col items-center'>
        <LogoAndTitle size='lg' />
        <a href='#installation-guide'>
          <Button
            size='lg'
            className='uppercase hover:scale-104 transition-transform'>
            Почати грати
          </Button>
        </a>
        <ServerInfo className='mx-auto mt-12 min-w-[200px]' />
      </div>
    </div>
  );
};
