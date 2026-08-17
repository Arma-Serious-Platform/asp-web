'use client';

import { SelectOption } from '@/shared/ui/atoms/select';
import { User } from '@/shared/sdk/types';
import { UserModel } from '@/entities/user/user.model';

import { UserNicknameText } from './user-text';

type UserLike = User | UserModel;

const toUser = (user: UserLike): User => (user instanceof UserModel ? user.data : user) as User;

export const mapUsersToSelectOptions = (users: UserLike[]): SelectOption[] =>
  users.map(user => {
    const u = toUser(user);
    return {
      label: u.nickname,
      value: u.id,
      searchText: [u.nickname, (u.squad as { tag?: string } | null)?.tag].filter(Boolean).join(' '),
      content: <UserNicknameText user={u} link={false} className="text-sm" />,
    };
  });

export const withCurrentLeaderOption = (options: SelectOption[], leader?: User | null): SelectOption[] => {
  if (!leader?.id) {
    return options;
  }

  if (options.some(option => option.value === leader.id)) {
    return options;
  }

  return [...mapUsersToSelectOptions([leader]), ...options];
};
