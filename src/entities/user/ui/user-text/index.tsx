import { SideType, SquadRole, User, UserRole, UserStatus } from '@/shared/sdk/types';
import classNames from 'classnames';
import { FC, PropsWithChildren } from 'react';
import { getUserRoleColor, getUserRoleText, getUserStatusText } from '../../lib';
import dayjs from 'dayjs';
import Link from 'next/link';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/utils/cn';

const UserProfileLink: FC<
  PropsWithChildren<{
    link?: boolean;
    className?: string;
    user: Pick<User, 'nickname'>;
  }> &
    PropsWithChildren
> = ({ link = true, className, user, children }) => {
  if (!link) return <span className={className}>{children}</span>;

  return (
    <Link className={cn('inline hover:underline', className)} href={ROUTES.user.profileById(user.nickname)}>
      {children}
    </Link>
  );
};

export const UserNicknameText: FC<{
  user:
    | User
    | (Pick<User, 'id' | 'nickname'> &
        Partial<Pick<User, 'roles' | 'squadRole' | 'avatar'>> & {
          squad?: {
            tag?: string;
            side?: { type?: SideType };
          } | null;
        })
    | null;
  tag?: string;
  sideType?: SideType;
  className?: string;
  link?: boolean;
}> = ({ user, tag, sideType, className, link = true }) => {
  if (!user?.nickname) return '';

  if ((tag && sideType) || user?.squad?.tag) {
    const type = sideType || user?.squad?.side?.type;

    const TAG = user?.squadRole === SquadRole.RECRUIT ? `[~${user.squad?.tag}~] ` : `[${tag || user.squad?.tag}] `;

    return (
      <UserProfileLink link={link} className={cn(className, 'whitespace-nowrap')} user={user}>
        <span
          className={classNames({
            'text-blue-500': type === SideType.BLUE,
            'text-red-500': type === SideType.RED,
            'text-gray-500': type === SideType.UNASSIGNED,
          })}>
          {TAG}
        </span>
        <span className={cn(getUserRoleColor(user.roles))}>{user.nickname}</span>
      </UserProfileLink>
    );
  }

  return (
    <UserProfileLink link={link} className={className} user={user}>
      <span className={cn(getUserRoleColor(user.roles))}>{user.nickname}</span>
    </UserProfileLink>
  );
};

export const UserRoleText: FC<{
  roles?: UserRole[] | null;
  className?: string;
}> = ({ roles, className }) => {
  if (!roles?.length) return null;

  return (
    <span className={cn(getUserRoleColor(roles), className)}>
      {getUserRoleText(roles)}
    </span>
  );
};

export const UserStatusText: FC<{
  status?: UserStatus;
  className?: string;
  bannedUntil?: Date | null;
  banReason?: string | null;
}> = ({ status, bannedUntil = null, banReason = null, className }) => {
  if (!status) return null;

  const isPermanentBan = status === UserStatus.BANNED && !bannedUntil;

  return (
    <span
      className={classNames(
        {
          'text-green-500': status === UserStatus.ACTIVE,
          'text-red-500': status === UserStatus.BANNED,
          'text-blue-500': status === UserStatus.INVITED,
        },
        className,
      )}>
      {getUserStatusText(status)}
      {bannedUntil && <span className="text-red-500"> {dayjs(bannedUntil).format('DD.MM.YYYY HH:mm')}</span>}
      {isPermanentBan && <span className="text-red-500"> назавжди</span>}
      {status === UserStatus.BANNED && banReason && <span className="ml-1 text-zinc-400">— {banReason}</span>}
    </span>
  );
};
