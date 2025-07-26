import { ServerInfo } from '@/features/server-info';

import { Button } from '@/shared/ui/atoms/button';
import Image from 'next/image';
import { FC } from 'react';

export const Hero: FC<{}> = () => {
  return (
    <div className='relative flex flex-col items-center justify-center h-screen w-full shadow-2xl shadow-black'>
      <video
        className='absolute inset-0 w-full h-full object-cover z-10 '
        src='/media/hero.webm'
        autoPlay
        muted
        loop
      />
      <div className='absolute inset-0 bg-black opacity-75 z-10'></div>
      <div className='absolute inset-0 z-10 text-white text-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        <Image
          className='mx-auto'
          priority
          src='/images/logo.webp'
          width={256}
          height={256}
          alt='VTG logo'
        />
        <h1 className='text-4xl font-bold mb-4'>
          <span className='tracking-widest font-extrabold'>
            VIRTUAL TACTICAL GAMES
          </span>
          <br />
          <span className='text-2xl font-light'>
            Українська Arma III спільнота
          </span>
        </h1>
        <Button
          size='lg'
          className='uppercase hover:scale-104 transition-transform'>
          Почати грати
        </Button>
        <ServerInfo className='mx-auto my-4 min-w-[200px]' />
      </div>
    </div>
  );
};
