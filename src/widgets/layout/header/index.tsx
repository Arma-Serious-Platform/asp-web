'use client';

import { session } from '@/entities/session/model';
import { ScheduleInfo } from '@/features/schedule';
import { View } from '@/features/view';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/atoms/button';
import { Link } from '@/shared/ui/atoms/link';
import { Popover } from '@/shared/ui/moleculas/popover';
import { Avatar } from '@/shared/ui/organisms/avatar';
import NextLink from 'next/link';

import classNames from 'classnames';
import {
  Loader2Icon,
  LogOutIcon,
  MenuIcon,
  ShieldUserIcon,
  UserIcon,
  XIcon,
} from 'lucide-react';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';

import { FC, useEffect, useState } from 'react';

import { cn } from '@/shared/utils/cn';
import { hasAccessToAdminPanel } from '@/entities/user/lib';
import { env } from '@/shared/config/env';
import { Social } from '@/features/social/ui';
import { useRouter } from 'next/navigation';

export type HeaderProps = {
  enableScrollVisibility?: boolean;
};

const MainLinks: FC<{
  className?: string;
  activeClassName?: string;
}> = ({ className, activeClassName }) => (
  <>
    <Link
      className={className}
      activeClassName={activeClassName}
      href={ROUTES.home}>
      Почати грати
    </Link>
    <Link
      className={className}
      activeClassName={activeClassName}
      href={ROUTES.rules}>
      Правила
    </Link>
    <a
      className={className}
      href='https://docs.google.com/spreadsheets/d/1WAqlUvOtcD-SQr2ebIzxh0ZJgXq1_7IpKHT6u-duSec/edit?gid=525821223#gid=525821223'
      target='_blank'
      rel='noopener noreferrer'>
      Розклад
    </a>
    {!env.isLanding && (
      <Link
        className={className}
        activeClassName={activeClassName}
        href={ROUTES.squads}>
        Загони
      </Link>
    )}
    <a
      className={className}
      href='https://replays.vtg.in.ua'
      target='_blank'
      rel='noopener noreferrer'>
      Реплеї
    </a>
  </>
);

const AuthLinks: FC<{ className?: string; activeClassName?: string }> =
  observer(({ className, activeClassName }) => {
    const router = useRouter();

    if (session.preloader.isLoading) {
      return (
        <div className='flex items-center justify-between gap-7 mx-4'>
          <Loader2Icon className='w-4 h-4 animate-spin' />
        </div>
      );
    }

    return (
      <>
        {(!session.isAuthorized || !session.user?.user) && !env.isLanding && (
          <>
            <Link
              className={className}
              activeClassName={activeClassName}
              href={ROUTES.auth.login}>
              Увійти
            </Link>
            <Link
              className={className}
              activeClassName={activeClassName}
              href={ROUTES.auth.signup}>
              Реєстрація
            </Link>
          </>
        )}

        {session.isAuthorized && session.user?.user && !env.isLanding && (
          <>
            <Popover
              className='flex flex-col gap-1 w-fit p-0 border-none min-w-40'
              trigger={
                <Button
                  className={cn(
                    'gap-3 border-none bg-transparent hover:bg-transparent'
                  )}>
                  <Avatar size='sm' src={session.user?.user?.avatar?.url} />
                  {session.user?.user?.nickname}
                </Button>
              }>
              <NextLink
                className={className}
                href={`${ROUTES.user.profile}?tab=profile`}>
                <Button align='left' className='w-full' size='sm'>
                  <UserIcon className='size-4' />
                  Профіль
                </Button>
              </NextLink>
              <View.Condition
                if={hasAccessToAdminPanel(session.user?.user?.role)}>
                <NextLink className={className} href={ROUTES.admin.users}>
                  <Button align='left' className='w-full' size='sm'>
                    <ShieldUserIcon className='size-4' />
                    Адміністрування
                  </Button>
                </NextLink>
              </View.Condition>
              <NextLink
                className={className}
                href={ROUTES.auth.login}
                onClick={(e) => {
                  e.preventDefault();

                  session.logout();
                  router.push(ROUTES.auth.login);
                }}>
                <Button
                  align='left'
                  className={cn('w-full', className)}
                  size='sm'>
                  <LogOutIcon className='size-4' />
                  Вийти
                </Button>
              </NextLink>
            </Popover>
          </>
        )}
      </>
    );
  });

const MobileMenu: FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  useEffect(() => {
    window.document.body.style.overflow = isOpen ? 'hidden' : 'auto';
  }, [isOpen]);

  return (
    <div
      className={cn(
        'absolute top-0 left-0 w-screen h-screen bg-neutral-900 z-50 transition-all duration-300 flex flex-col',
        {
          hidden: !isOpen,
        }
      )}>
      <div className='mx-auto'>
        <Link href={ROUTES.home}>
          <Image
            className='mr-4 hover:scale-110 transition-all duration-700'
            priority
            src='/images/logo.webp'
            width={100}
            height={100}
            alt='logo'
          />
        </Link>

        <div className='absolute top-4 right-4'>
          <XIcon className='w-6 h-6' onClick={onClose} />
        </div>
      </div>

      <ScheduleInfo className='my-2 mx-auto' />

      <div className='flex flex-col'>
        <MainLinks
          className='block px-4 py-2'
          activeClassName='bg-primary !text-white '
        />
        <div className='mt-10 flex gap-2 w-full justify-between px-4'>
          <AuthLinks
            className='block px-4 py-2 mx-auto bg-primary text-center w-full'
            activeClassName='bg-primary !text-white'
          />
        </div>
      </div>

      <Social
        className='mt-10 mx-auto mb-8 justify-center gap-10 w-full px-4'
        size={24}
      />
    </div>
  );
};

export const Header: FC<HeaderProps> = observer(
  ({ enableScrollVisibility = false }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
      if (!enableScrollVisibility) return;

      if (window.screenY > 0) {
        setIsScrolled(true);
      }

      window.addEventListener(
        'scroll',
        () => {
          setIsScrolled(window.scrollY > 0);
        },
        { passive: true }
      );

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
            'overflow-hidden': !isMobileMenuOpen,
          }
        )}>
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        <div className='container max-lg:mx-4 flex items-center justify-between'>
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

          <div className='mx-auto flex items-center justify-between w-full max-lg:hidden'>
            <div className='flex items-center justify-between gap-7 mr-auto'>
              <MainLinks />
            </div>

            <View.Condition if={session.preloader.isLoading}>
              <div className='flex items-center justify-between gap-7 mx-4'>
                <Loader2Icon className='w-4 h-4 animate-spin' />
              </div>
            </View.Condition>
            <div className='flex items-center justify-between gap-7 mx-4'>
              <Social size={24} />
              <ScheduleInfo className='mr-4 hidden lg:flex' />
              <View.Condition if={!session.preloader.isLoading}>
                <AuthLinks />
              </View.Condition>
            </div>
          </div>
          <div className='flex items-center justify-center min-lg:hidden'>
            <MenuIcon
              className='w-6 h-6'
              onClick={() => setIsMobileMenuOpen(true)}
            />
          </div>
        </div>
      </header>
    );
  }
);
