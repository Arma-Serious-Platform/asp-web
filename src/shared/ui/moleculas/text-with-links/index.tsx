'use client';

import { linkifyText } from '@/shared/utils/linkify';
import { cn } from '@/shared/utils/cn';
import { FC, Fragment, useMemo } from 'react';

type TextWithLinksProps = {
  text: string;
  className?: string;
  linkClassName?: string;
};

export const TextWithLinks: FC<TextWithLinksProps> = ({ text, className, linkClassName }) => {
  const parts = useMemo(() => linkifyText(text), [text]);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.type === 'link' ? (
          <a
            key={index}
            href={part.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn('break-all underline hover:opacity-80', linkClassName ?? 'text-primary')}>
            {part.value}
          </a>
        ) : (
          <Fragment key={index}>{part.value}</Fragment>
        ),
      )}
    </span>
  );
};
