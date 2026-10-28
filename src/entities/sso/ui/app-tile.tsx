import classNames from 'classnames';
import Image from 'next/image';
import { FC } from 'react';

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase() || '?';

/** A connected app's tile: its initials, or the VTG logo for our own apps. */
export const AppTile: FC<{ name: string; vtg?: boolean; size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  name,
  vtg = false,
  size = 'lg',
  className,
}) => (
  <div
    className={classNames(
      'flex shrink-0 items-center justify-center border border-white/10 font-bold',
      vtg ? 'bg-neutral-950' : 'bg-slate-800 text-sky-200',
      {
        'size-7 rounded-md text-[11px]': size === 'sm',
        'size-12 rounded-xl text-base': size === 'md',
        'size-13 rounded-xl text-lg': size === 'lg',
      },
      className,
    )}>
    {vtg ? (
      <Image
        src="/images/logo.webp"
        alt=""
        width={38}
        height={38}
        className={classNames({ 'size-5': size === 'sm', 'size-8': size === 'md', 'size-9.5': size === 'lg' })}
      />
    ) : (
      getInitials(name)
    )}
  </div>
);
