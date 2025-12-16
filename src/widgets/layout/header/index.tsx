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
import { headerModel } from './model';
import { UserNicknameText } from '@/entities/user/ui/user-text';

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
              className='flex flex-col gap-1 p-0 max-w-44'
              trigger={
                <Button
                  className={cn(
                    'min-w-44 gap-3 border-none bg-transparent hover:bg-primary/50'
                  )}>
                  <Avatar size='sm' src={session.user?.user?.avatar?.url} />
                  <UserNicknameText user={session.user?.user} link={false} />
                </Button>
              }>
              <NextLink href={`${ROUTES.user.profile}?tab=profile`}>
                <Button
                  align='left'
                  size='sm'
                  className='flex w-full items-center gap-2 rounded-md bg-transparent px-2 py-1.5 text-sm font-medium text-zinc-100 hover:bg-white/5'>
                  <UserIcon className='size-4' />
                  <span>Профіль</span>
                </Button>
              </NextLink>
              <View.Condition
                if={hasAccessToAdminPanel(session.user?.user?.role)}>
                <NextLink href={ROUTES.admin.users}>
                  <Button
                    align='left'
                    size='sm'
                    className='flex w-full items-center gap-2 rounded-md bg-transparent px-2 py-1.5 text-sm font-medium text-zinc-100 hover:bg-white/5'>
                    <ShieldUserIcon className='size-4' />
                    <span>Адміністрування</span>
                  </Button>
                </NextLink>
              </View.Condition>
              <NextLink
                href={ROUTES.auth.login}
                onClick={(e) => {
                  e.preventDefault();

                  session.logout();
                }}>
                <Button
                  align='left'
                  size='sm'
                  className='flex w-full items-center gap-2 rounded-md bg-transparent px-2 py-1.5 text-sm font-medium text-red-300 hover:bg-red-600/20 hover:text-red-200'>
                  <LogOutIcon className='size-4' />
                  <span>Вийти</span>
                </Button>
              </NextLink>
            </Popover>
          </>
        )}
      </>
    );
  });

export const MobileMenu = observer(() => {
  useEffect(() => {
    window.document.body.style.overflow = headerModel.mobileMenu.isOpen
      ? 'hidden'
      : 'auto';
  }, [headerModel.mobileMenu.isOpen]);

  useEffect(() => {
    return () => headerModel.mobileMenu.close();
  }, []);

  return (
    <div
      className={cn(
        'fixed top-0 left-0 z-50 flex h-screen w-screen flex-col bg-gradient-to-b from-black/95 via-neutral-950/98 to-black/95 transition-transform duration-300',
        {
          'translate-x-full': !headerModel.mobileMenu.isOpen,
        }
      )}>
      <div className='relative mx-auto flex w-full max-w-xl flex-col px-4 pt-4'>
        <div className='flex items-center justify-between'>
          <Link href={ROUTES.home} onClick={headerModel.mobileMenu.close}>
            <Image
              className='mr-2 transition-transform duration-300 hover:scale-105'
              priority
              src='/images/logo.webp'
              width={72}
              height={72}
              alt='logo'
            />
          </Link>
          <button
            type='button'
            aria-label='Закрити меню'
            className='inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-black/60 text-zinc-200 shadow-md transition-colors hover:bg-white/10'
            onClick={headerModel.mobileMenu.close}>
            <XIcon className='h-5 w-5' />
          </button>
        </div>

        <div className='mt-4 flex items-center justify-between rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-zinc-200'>
          <span className='font-semibold uppercase tracking-[0.24em] text-zinc-400'>
            Розклад ігор
          </span>
          <ScheduleInfo className='ml-3' version='short' />
        </div>

        <div className='mt-5 flex-1 overflow-y-auto pb-6'>
          <nav className='paper rounded-xl border px-4 py-4 shadow-xl'>
            <div className='border-b border-white/10 pb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400'>
              Навігація
            </div>
            <div className='mt-2 flex flex-col'>
              <MainLinks
                className='block px-2 py-2 text-sm font-medium text-zinc-100 hover:bg-white/5 rounded-md'
                activeClassName='bg-primary text-white rounded-md'
              />
            </div>
          </nav>

          <View.Condition if={!env.isLanding}>
            <div className='mt-5'>
              <div className='paper rounded-xl border px-4 py-4 shadow-xl'>
                <div className='border-b border-white/10 pb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400'>
                  Обліковий запис
                </div>
                <div className='mt-3 flex flex-col gap-2'>
                  <AuthLinks
                    className='block w-full rounded-md px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-primary/80 hover:text-white text-center'
                    activeClassName='bg-primary text-white rounded-md'
                  />
                </div>
              </div>
            </div>
          </View.Condition>

          <div className='mt-6 flex flex-col items-center gap-3'>
            <div className='text-[11px] font-semibold uppercase tracking-[0.26em] text-zinc-500'>
              Ми в соцмережах
            </div>
            <Social className='mx-auto mb-2 flex w-full justify-center gap-8' />
          </div>
        </div>
      </div>
    </div>
  );
});

export const Header: FC<HeaderProps> = observer(
  ({ enableScrollVisibility = false }) => {
    const [isScrolled, setIsScrolled] = useState(false);

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
          'w-full h-16 sticky top-0 z-30 mx-auto flex items-center justify-center transition-colors duration-300 bg-card',
          {
            '!fixed': enableScrollVisibility,
            'bg-transparent': !isScrolled && enableScrollVisibility,
            'bg-card/75 backdrop-blur-xs': isScrolled && enableScrollVisibility,
            'overflow-hidden': !headerModel.mobileMenu.isOpen,
          }
        )}>
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
            <div className='mr-auto flex items-center justify-between gap-6'>
              <MainLinks
                className='rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-200 transition-colors hover:bg-white/10 hover:text-white'
                activeClassName='bg-primary/90 text-white rounded-md'
              />
            </div>

            <div className='mx-4 flex items-center justify-between gap-7'>
              <Social iconClassName='size-4' />
              <ScheduleInfo className='mr-4 hidden min-2xl:flex' />
              <ScheduleInfo
                className='my-2 mx-auto hidden max-2xl:flex'
                version='short'
              />
              <View.Condition if={session.preloader.isLoading}>
                <div className='flex items-center justify-between gap-7 mx-4'>
                  <Loader2Icon className='w-4 h-4 animate-spin' />
                </div>
              </View.Condition>
              <View.Condition if={!session.preloader.isLoading}>
                <AuthLinks
                  className='rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-200 transition-colors hover:bg-primary/90 hover:text-white'
                  activeClassName='bg-primary/90 text-white rounded-md'
                />
              </View.Condition>
            </div>
          </div>
          <div className='flex items-center justify-center min-lg:hidden'>
            <MenuIcon
              className='w-6 h-6'
              onClick={() => headerModel.mobileMenu.open()}
            />
          </div>
        </div>
      </header>
    );
  }
);
