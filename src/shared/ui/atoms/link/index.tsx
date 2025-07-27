'use client';

import { FC, MouseEventHandler, PropsWithChildren } from 'react';
import NextLink from 'next/link';
import classNames from 'classnames';
import { ROUTES } from '@/shared/config/routes';
import { usePathname } from 'next/navigation';

export const Link: FC<
  PropsWithChildren<{
    href: keyof typeof ROUTES | string;
    className?: string;
    isActive?: boolean;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
  }>
> = ({ children, href, className, isActive, onClick }) => {
  const pathname = usePathname();

  return (
    <NextLink
      href={href}
      className={classNames(className, {
        'text-text-primary': isActive || pathname === href,
      })}
      onClick={onClick}>
      {children}
    </NextLink>
  );
};
