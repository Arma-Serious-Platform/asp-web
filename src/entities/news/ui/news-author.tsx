import { FC, ComponentProps } from 'react';
import { FeatherIcon } from 'lucide-react';

import { UserNicknameText } from '@/entities/user/ui/user-text';
import { cn } from '@/shared/utils/cn';

type NewsAuthorProps = {
  user: ComponentProps<typeof UserNicknameText>['user'];
  link?: boolean;
  className?: string;
};

export const NewsAuthor: FC<NewsAuthorProps> = ({ user, link = true, className }) => {
  if (!user) return null;

  return (
    <div className={cn('inline-flex items-center gap-1.5 text-sm text-zinc-400', className)}>
      <FeatherIcon className="size-3.5 shrink-0" />
      <UserNicknameText user={user} link={link} />
    </div>
  );
};
