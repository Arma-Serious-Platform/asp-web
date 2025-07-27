'use client';

import { session } from '@/entities/session/model';
import { ScheduleInfo } from '@/features/schedule';
import { View } from '@/features/view';
import { ROUTES } from '@/shared/config/routes';
import { Link } from '@/shared/ui/atoms/link';

import classNames from 'classnames';
import { Loader2Icon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';

import { FC, useEffect, useState } from 'react';

export type HeaderProps = {
  enableScrollVisibility?: boolean;
};

export const Header: FC<HeaderProps> = observer(
  ({ enableScrollVisibility = false }) => {
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

          <View.Condition if={session.preloader.isLoading}>
            <div className='flex items-center justify-between gap-7'>
              <Loader2Icon className='w-4 h-4 animate-spin' />
            </div>
          </View.Condition>
          <View.Condition if={!session.preloader.isLoading}>
            <div className='flex items-center justify-between gap-7'>
              <ScheduleInfo className='mr-4' />
              {!session.isAuthorized && (
                <>
                  <Link href={ROUTES.auth.login}>Увійти</Link>
                  <Link href={ROUTES.auth.signup}>Реєстрація</Link>
                </>
              )}

              {session.isAuthorized && session.user?.user && (
                <>
                  <Link href={ROUTES.user.profile}>
                    {session.user?.user?.nickname}
                  </Link>
                  <Link
                    href={ROUTES.auth.login}
                    onClick={(e) => {
                      e.preventDefault();

                      session.logout();
                    }}>
                    Вийти
                  </Link>
                </>
              )}
            </div>
          </View.Condition>
        </div>
      </header>
    );
  }
);
