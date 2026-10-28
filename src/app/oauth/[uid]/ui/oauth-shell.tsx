import classNames from 'classnames';
import { ArrowLeftRightIcon } from 'lucide-react';
import Image from 'next/image';
import { FC, ReactNode } from 'react';

import { AppTile } from '@/entities/sso/ui/app-tile';
import type { SsoClient } from '@/shared/sdk/sso/sso.api';

/** The bare page around the sign-in card: no site navigation to wander off to. */
export const OauthShell: FC<{ children: ReactNode; footer?: ReactNode }> = ({ children, footer }) => (
  <div className="flex min-h-screen flex-col text-white">
    <header className="flex items-center gap-3 px-8 py-5">
      <Image src="/images/logo.webp" alt="" width={40} height={40} />
      <span className="text-lg font-bold tracking-[0.02em]">Virtual Tactical Games</span>
    </header>
    <main className="flex flex-1 items-center justify-center px-4 pt-4 pb-10">{children}</main>
    {footer && <footer className="flex justify-center px-4 pb-7">{footer}</footer>}
  </div>
);

export const OauthCard: FC<{ children: ReactNode; wide?: boolean; className?: string }> = ({
  children,
  wide = false,
  className,
}) => (
  <section
    className={classNames(
      'paper flex w-full flex-col gap-5 p-6 sm:p-8',
      wide ? 'max-w-[480px]' : 'max-w-[440px]',
      className,
    )}>
    {children}
  </section>
);

/** The app and VTG side by side. */
export const AppAndVtgTiles: FC<{ client: SsoClient }> = ({ client }) => (
  <div className="flex items-center justify-center gap-3.5">
    <AppTile name={client.name} vtg={client.firstParty} />
    <ArrowLeftRightIcon aria-hidden className="size-5.5 text-zinc-400" />
    <AppTile name="VTG" vtg />
  </div>
);

export const OauthButton: FC<{
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}> = ({ children, variant = 'primary', type = 'button', disabled, onClick, className }) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={classNames(
      'inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border px-4 text-base transition-colors disabled:pointer-events-none disabled:opacity-50',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
      variant === 'primary'
        ? 'border-lime-600 bg-lime-700 font-semibold text-white hover:bg-lime-600'
        : 'border-neutral-600 bg-neutral-800 font-medium text-zinc-100 hover:bg-neutral-700',
      className,
    )}>
    {children}
  </button>
);
