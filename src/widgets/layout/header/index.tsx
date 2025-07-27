'use client';

import { ScheduleInfo } from '@/features/schedule';
import { ROUTES } from '@/shared/config/routes';
import { Link } from '@/shared/ui/atoms/link';
import classNames from 'classnames';
import Image from 'next/image';

import { FC, useEffect, useState } from 'react';

export type HeaderProps = {
  enableScrollVisibility?: boolean;
};

export const Header: FC<HeaderProps> = ({ enableScrollVisibility = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!enableScrollVisibility) return;

    if (window.screenY > 0) {
      setIsScrolled(true);
    }

    window.addEventListener('scroll', () => {
      setIsScrolled(window.scrollY > 0);
    });

    return () => {
      window.removeEventListener('scroll', () => {});
    };
  }, [enableScrollVisibility]);

  return (
    <header
      className={classNames(
        'w-full h-16 sticky top-0 z-20 mx-auto flex items-center justify-center transition-colors duration-300 bg-card',
        {
          '!fixed': enableScrollVisibility,
          'bg-transparent': !isScrolled && enableScrollVisibility,
          'bg-card/75 backdrop-blur-xs': isScrolled && enableScrollVisibility,
        }
      )}>
      <div className='container mx-auto flex items-center justify-between'>
        <Link href={ROUTES.home}>
          <Image
            className='mr-4 hover:scale-110 transition-all duration-300'
            priority
            src='/images/logo.webp'
            width={64}
            height={64}
            alt='logo'
          />
        </Link>

        <div className='flex items-center justify-between mr-auto gap-7'>
          <Link href={ROUTES.home}>Почати грати</Link>
          <Link href={ROUTES.rules}>Правила</Link>
          <Link href={ROUTES.schedule}>Розклад</Link>
          <Link href={ROUTES.races}>Загони</Link>
          <Link href={ROUTES.replays}>Реплеї</Link>
        </div>

        <div className='flex items-center justify-between gap-7'>
          <ScheduleInfo className='mr-4' />
          <Link href={ROUTES.auth.login}>Увійти</Link>
          <Link href={ROUTES.auth.signup}>Реєстрація</Link>
        </div>
      </div>
    </header>
  );
};
