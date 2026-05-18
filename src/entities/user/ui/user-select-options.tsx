'use client';

import { SelectOption } from '@/shared/ui/atoms/select';
import { User } from '@/shared/sdk/types';

import { UserNicknameText } from './user-text';

export const mapUsersToSelectOptions = (users: User[]): SelectOption[] =>
  users.map(user => ({
    label: user.nickname,
    value: user.id,
    searchText: [user.nickname, user.squad?.tag].filter(Boolean).join(' '),
    content: <UserNicknameText user={user} link={false} className="text-sm" />,
  }));

export const withCurrentLeaderOption = (options: SelectOption[], leader?: User | null): SelectOption[] => {
  if (!leader?.id) {
    return options;
  }

  if (options.some(option => option.value === leader.id)) {
    return options;
  }

  return [...mapUsersToSelectOptions([leader]), ...options];
};
