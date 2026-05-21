import { Fragment, FC } from 'react';

import { UserNicknameText } from '@/entities/user/ui/user-text';
import { Mission, User } from '@/shared/sdk/types';

type MissionAuthorsTextProps = {
  mission: Pick<Mission, 'author' | 'coauthors'>;
  className?: string;
  labelClassName?: string;
  userClassName?: string;
  link?: boolean;
};

const getMissionAuthors = (mission: Pick<Mission, 'author' | 'coauthors'>): User[] => {
  const seenIds = new Set<string>();

  return [mission.author, ...(mission.coauthors ?? [])].filter((user): user is User => {
    if (!user?.id || seenIds.has(user.id)) return false;

    seenIds.add(user.id);
    return true;
  });
};

export const MissionAuthorsText: FC<MissionAuthorsTextProps> = ({
  mission,
  className,
  labelClassName,
  userClassName,
  link,
}) => {
  const authors = getMissionAuthors(mission);

  if (!authors.length) return null;

  return (
    <div className={className}>
      <span className={labelClassName}>{authors.length > 1 ? 'Автори' : 'Автор'}: </span>
      {authors.map((author, index) => (
        <Fragment key={author.id}>
          {index > 0 && <span>, </span>}
          <UserNicknameText user={author} className={userClassName} link={link} />
        </Fragment>
      ))}
    </div>
  );
};
