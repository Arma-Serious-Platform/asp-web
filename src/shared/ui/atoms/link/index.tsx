'use client';

import { FC, MouseEventHandler, PropsWithChildren } from 'react';
import NextLink from 'next/link';

import { ROUTES } from '@/shared/config/routes';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/utils/cn';

export const Link: FC<
  PropsWithChildren<{
    href: keyof typeof ROUTES | string;
    className?: string;
    activeClassName?: string;
    isActive?: boolean;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
  }>
> = ({ children, href, className, activeClassName, isActive, onClick }) => {
  const pathname = usePathname();

  return (
    <NextLink
      href={href}
      className={cn(className, {
        'text-text-primary': isActive || pathname === href,
        [activeClassName || '']: isActive || pathname === href,
      })}
      onClick={onClick}>
      {children}
    </NextLink>
  );
};
