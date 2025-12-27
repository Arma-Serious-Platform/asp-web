import { SideType, User, UserRole, UserStatus } from '@/shared/sdk/types';
import classNames from 'classnames';
import { FC, PropsWithChildren } from 'react';
import {
  getUserRoleColor,
  getUserRoleText,
  getUserStatusText,
  hasAccessToAdminPanel,
} from '../../lib';
import dayjs from 'dayjs';
import Link from 'next/link';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/utils/cn';

const UserProfileLink: FC<
  PropsWithChildren<{
    link?: boolean;
    className?: string;
    user: User;
  }> &
    PropsWithChildren
> = ({ link = true, className, user, children }) => {
  if (!link) return <span className={className}>{children}</span>;

  return (
    <Link
      className={cn('inline', className)}
      href={ROUTES.user.users.id(user.nickname)}>
      {children}
    </Link>
  );
};

export const UserNicknameText: FC<{
  user: User | null;
  tag?: string;
  sideType?: SideType;
  className?: string;
  link?: boolean;
}> = ({ user, tag, sideType, className, link = true }) => {
  if (!user?.nickname) return '';

  if ((tag && sideType) || user?.squad?.name) {
    const type = sideType || user?.squad?.side?.type;

    return (
      <UserProfileLink link={link} className={className} user={user}>
        <span
          className={classNames({
            'text-blue-500': type === SideType.BLUE,
            'text-red-500': type === SideType.RED,
            'text-gray-500': type === SideType.UNASSIGNED,
          })}>
          [{tag || user.squad?.tag}]
        </span>
        <span
          className={cn(getUserRoleColor(user.role, user.isMissionReviewer))}>
          {user.nickname}
        </span>
      </UserProfileLink>
    );
  }

  return (
    <UserProfileLink link={link} className={className} user={user}>
      <span className={cn(getUserRoleColor(user.role, user.isMissionReviewer))}>
        {user.nickname}
      </span>
    </UserProfileLink>
  );
};

export const UserRoleText: FC<{
  role?: UserRole;
  isMissionReviewer?: boolean;
  className?: string;
}> = ({ role, isMissionReviewer, className }) => {
  if (!role) return null;

  return (
    <span className={cn(getUserRoleColor(role, isMissionReviewer), className)}>
      {getUserRoleText(role, isMissionReviewer)}
    </span>
  );
};

export const UserStatusText: FC<{
  status?: UserStatus;
  className?: string;
  bannedUntil?: Date | null;
}> = ({ status, bannedUntil = null, className }) => {
  if (!status) return null;

  return (
    <span
      className={classNames(
        {
          'text-green-500': status === UserStatus.ACTIVE,
          'text-red-500': status === UserStatus.BANNED,
          'text-blue-500': status === UserStatus.INVITED,
        },
        className
      )}>
      {getUserStatusText(status)}
      {bannedUntil && (
        <span className='text-red-500'>
          {dayjs(bannedUntil).format('DD.MM.YYYY HH:mm')}
        </span>
      )}
    </span>
  );
};
