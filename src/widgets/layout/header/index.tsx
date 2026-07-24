'use client';

import { session } from '@/entities/session/model';
import { ScheduleInfo } from '@/features/schedule';
import { View } from '@/features/view';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/atoms/button';
import { Link } from '@/shared/ui/atoms/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/organisms/dialog';
import { Popover } from '@/shared/ui/moleculas/popover';
import { Avatar } from '@/shared/ui/organisms/avatar';
import NextLink from 'next/link';

import classNames from 'classnames';
import { ChevronDownIcon, LogOutIcon, MapIcon, MenuIcon, ShieldUserIcon, UserIcon, UsersIcon, XIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';

import { FC, useEffect, useState } from 'react';

import { cn } from '@/shared/utils/cn';
import { getUserRoleText } from '@/entities/user/lib';
import { env } from '@/shared/config/env';
import { Social } from '@/features/social/ui';
import { headerModel } from './model';
import { UserNicknameText } from '@/entities/user/ui/user-text';

export type HeaderProps = {
  enableScrollVisibility?: boolean;
};

const getFirstAdminRoute = () => {
  if (session.canManageUsers) return ROUTES.admin.users;
  if (session.canManageWeekends) return ROUTES.admin.weekends;
  if (session.canManageIslands) return ROUTES.admin.islands;
  if (session.canManageServers) return ROUTES.admin.servers;
  if (session.canManageSquadsAndSides) return ROUTES.admin.squads;
  if (session.canManageRules) return ROUTES.admin.rules;
  if (session.canManageSpecializations) return ROUTES.admin.specializations;

  return ROUTES.home;
};

const MainLinks: FC<{
  className?: string;
  activeClassName?: string;
}> = observer(({ className, activeClassName }) => {
  return (
    <>
      {session.canAccessHeadquarters && (
        <Link className={className} href={ROUTES.hq.plans}>
          Штаб
        </Link>
      )}
      {!session.canAccessHeadquarters && (
        <Link className={className} activeClassName={activeClassName} href={ROUTES.home}>
          Грати
        </Link>
      )}
      <Link className={className} activeClassName={activeClassName} href={ROUTES.rules}>
        Правила
      </Link>

      {env.isLanding && (
        <Link
          className={className}
          activeClassName={activeClassName}
          href="https://docs.google.com/spreadsheets/d/1WAqlUvOtcD-SQr2ebIzxh0ZJgXq1_7IpKHT6u-duSec/edit?gid=525821223#gid=525821223">
          Анонси
        </Link>
      )}

      {!env.isLanding && (
        <Link className={className} activeClassName={activeClassName} href={ROUTES.weekends}>
          Анонси
        </Link>
      )}

      {!env.isLanding && session.isAuthorized && (
        <Link className={className} activeClassName={activeClassName} href={ROUTES.missions.root}>
          Місії
        </Link>
      )}

      {!env.isLanding && (
        <Link className={className} activeClassName={activeClassName} href={ROUTES.squads}>
          Загони
        </Link>
      )}
      <a className={className} href="https://replays.vtg.in.ua" target="_blank" rel="noopener noreferrer">
        Реплеї
      </a>

      <a className={className} href="https://feedback.vtg.in.ua" target="_blank" rel="noopener noreferrer">
        Баг-трекер
      </a>
    </>
  );
});

const AuthLinks: FC<{ className?: string; activeClassName?: string }> = observer(({ className, activeClassName }) => {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  if (!session.isSessionReady) {
    return null;
  }

  return (
    <>
      {(!session.isAuthorized || !session.user?.user) && !env.isLanding && (
        <>
          <Link className={className} activeClassName={activeClassName} href={ROUTES.auth.login}>
            Увійти
          </Link>
          <Link className={className} activeClassName={activeClassName} href={ROUTES.auth.signup}>
            Реєстрація
          </Link>
        </>
      )}

      {session.isAuthorized && session.user?.user && !env.isLanding && (
        <>
          <Popover
            className="flex flex-col p-1 w-48 border border-white/5 bg-neutral-900/90 backdrop-blur-md shadow-xl rounded-xl duration-300 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=open]:slide-in-from-top-2 data-[state=closed]:slide-out-to-top-2"
            trigger={
              <button
                type="button"
                className="group flex items-center gap-2 px-2.5 py-1 rounded-md bg-transparent hover:bg-white/5 active:bg-white/10 data-[state=open]:bg-white/5 transition-all duration-200 cursor-pointer outline-hidden"
              >
                <Avatar size="sm" src={session.user?.user?.avatar?.url} />
                <UserNicknameText user={session.user?.user} link={false} className="text-xs font-semibold tracking-wide text-zinc-200" />
                <ChevronDownIcon className="size-3 text-zinc-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </button>
            }>
            
            {/* Minimalist Header with User Role */}
            <div className="px-2 py-1 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">
              {getUserRoleText(session.user?.user?.roles)}
            </div>

            <div className="h-px bg-white/5 my-0.5" />

            <View.Condition if={session.isHasAdminPanelAccess}>
              <NextLink href={getFirstAdminRoute()} className="w-full block">
                <Button
                  variant="ghost"
                  align="left"
                  className="w-full border-none text-zinc-300 hover:text-zinc-100 hover:bg-white/5 px-2 py-1.5 text-xs rounded-md flex items-center gap-2 transition-all duration-150">
                  <ShieldUserIcon className="size-3.5 text-zinc-400" />
                  <span>Адміністрування</span>
                </Button>
              </NextLink>
            </View.Condition>

            <NextLink href={`${ROUTES.user.profile}?tab=profile`} className="w-full block">
              <Button
                variant="ghost"
                align="left"
                className="w-full border-none text-zinc-300 hover:text-zinc-100 hover:bg-white/5 px-2 py-1.5 text-xs rounded-md flex items-center gap-2 transition-all duration-150">
                <UserIcon className="size-3.5 text-zinc-400" />
                <span>Профіль</span>
              </Button>
            </NextLink>

            {session.user?.user?.squad && (
              <NextLink href={`${ROUTES.user.profile}?tab=squad`} className="w-full block">
                <Button
                  variant="ghost"
                  align="left"
                  className="w-full border-none text-zinc-300 hover:text-zinc-100 hover:bg-white/5 px-2 py-1.5 text-xs rounded-md flex items-center gap-2 transition-all duration-150">
                  <UsersIcon className="size-3.5 text-zinc-400" />
                  <span>Мій загін</span>
                </Button>
              </NextLink>
            )}

            {Boolean(session.user?.user?._count?.missions) && session.user?.user?._count?.missions > 0 && (
              <NextLink href={`${ROUTES.missions.root}?authorId=${session.user?.user?.id}`} className="w-full block">
                <Button
                  variant="ghost"
                  align="left"
                  className="w-full border-none text-zinc-300 hover:text-zinc-100 hover:bg-white/5 px-2 py-1.5 text-xs rounded-md flex items-center gap-2 transition-all duration-150">
                  <MapIcon className="size-3.5 text-zinc-400" />
                  <span>Мої місії</span>
                </Button>
              </NextLink>
            )}

            {/* Subtle Divider before Log Out */}
            <div className="h-px bg-white/5 my-0.5" />

            <button type="button" onClick={() => setLogoutDialogOpen(true)} className="w-full block cursor-pointer">
              <Button
                variant="ghost"
                align="left"
                className="w-full border-none text-red-400/90 hover:text-red-300 hover:bg-red-500/10 px-2 py-1.5 text-xs rounded-md flex items-center gap-2 transition-all duration-150">
                <LogOutIcon className="size-3.5 text-red-400/70" />
                <span>Вийти</span>
              </Button>
            </button>
            <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
              <DialogContent showCloseButton>
                <DialogHeader>
                  <DialogTitle>Вийти з облікового запису</DialogTitle>
                  <DialogDescription>Ви впевнені, що хочете вийти?</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2">
                  <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
                    Скасувати
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      setLogoutDialogOpen(false);
                      await session.logout();
                    }}>
                    Вийти
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Popover>
        </>
      )}
    </>
  );
});

export const MobileMenu = observer(() => {
  useEffect(() => {
    window.document.body.style.overflow = headerModel.mobileMenu.isOpen ? 'hidden' : 'auto';
  }, [headerModel.mobileMenu.isOpen]);

  useEffect(() => {
    return () => headerModel.mobileMenu.close();
  }, []);

  return (
    <div
      className={cn(
        'fixed top-0 left-0 z-50 flex h-screen w-screen flex-col bg-linear-to-b from-black/95 via-neutral-950/98 to-black/95 transition-transform duration-300',
        {
          'translate-x-full': !headerModel.mobileMenu.isOpen,
        },
      )}>
      <div className="relative mx-auto flex w-full max-w-xl flex-col px-4 pt-4">
        <div className="flex items-center justify-between">
          <Link className="w-fit shrink-0" href={ROUTES.home} onClick={headerModel.mobileMenu.close}>
            <Image
              className="mr-2 transition-transform duration-300 hover:scale-105"
              priority
              src="/images/logo.webp"
              width={72}
              height={72}
              alt="logo"
            />
          </Link>
          <button
            type="button"
            aria-label="Закрити меню"
            className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-black/60 text-zinc-200 shadow-md transition-colors hover:bg-white/10"
            onClick={headerModel.mobileMenu.close}>
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-zinc-200">
          <span className="font-semibold uppercase tracking-[0.24em] text-zinc-400">Анонси</span>
          <ScheduleInfo className="ml-3" version="short" />
        </div>

        <div className="mt-5 flex-1 overflow-y-auto pb-6">
          <nav className="paper rounded-xl border px-4 py-4 shadow-xl">
            <div className="border-b border-white/10 pb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
              Навігація
            </div>
            <div className="mt-2 flex flex-col">
              <MainLinks
                className="block px-2 py-2 text-sm font-medium text-zinc-100 hover:bg-white/5 rounded-md"
                activeClassName="bg-primary text-white rounded-md"
              />
            </div>
          </nav>

          <View.Condition if={!env.isLanding}>
            <div className="mt-5">
              <div className="paper rounded-xl border px-4 py-4 shadow-xl">
                <div className="border-b border-white/10 pb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                  Обліковий запис
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <AuthLinks
                    className="block w-full rounded-md px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-primary/80 hover:text-white text-center"
                    activeClassName="bg-primary text-white rounded-md"
                  />
                </div>
              </div>
            </div>
          </View.Condition>

          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-zinc-500">Ми в соцмережах</div>
            <Social className="mx-auto mb-2 flex w-full justify-center gap-8" />
          </div>
        </div>
      </div>
    </div>
  );
});

export const Header: FC<HeaderProps> = observer(({ enableScrollVisibility = false }) => {
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
      { passive: true },
    );

    return () => {
      window.removeEventListener('scroll', () => {});
    };
  }, [enableScrollVisibility]);

  return (
    <header
      className={cn(
        'w-full h-16 sticky top-0 z-30 mx-auto flex items-center justify-center transition-colors duration-300 bg-card',
        {
          fixed: enableScrollVisibility,
          'bg-transparent': !isScrolled && enableScrollVisibility,
          'bg-card/75 backdrop-blur-xs': isScrolled && enableScrollVisibility,
          'overflow-hidden': !headerModel.mobileMenu.isOpen,
        },
      )}>
      <div className="container max-lg:mx-4 flex items-center justify-between">
        <Link className="w-fit shrink-0" href={ROUTES.home}>
          <Image
            className="mr-4 hover:scale-110 transition-all duration-300"
            priority
            src="/images/logo.webp"
            width={64}
            height={64}
            alt="logo"
          />
        </Link>

        <div className="mx-auto flex items-center justify-between w-full max-lg:hidden">
          <div className="mr-auto flex items-center justify-between gap-3">
            <MainLinks
              className="rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-200 transition-colors hover:bg-white/10 hover:text-white"
              activeClassName="bg-primary/90 text-white rounded-md"
            />
          </div>

          <div className="mx-4 flex items-center justify-between gap-7">
            <Social iconClassName="size-4 shrink-0" />
            <ScheduleInfo className="mr-4 hidden 2xl:flex" />
            <ScheduleInfo className="my-2 mx-auto hidden max-2xl:flex" version="short" />

            <AuthLinks
              className="rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-200 transition-colors hover:bg-primary/90 hover:text-white"
              activeClassName="bg-primary/90 text-white rounded-md"
            />
          </div>
        </div>
        <div className="flex items-center justify-center lg:hidden">
          <MenuIcon className="w-6 h-6" onClick={() => headerModel.mobileMenu.open()} />
        </div>
      </div>
    </header>
  );
});
