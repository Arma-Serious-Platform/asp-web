import { FC } from 'react';
import { GlobeIcon, LucideIcon, ScrollTextIcon, WrenchIcon } from 'lucide-react';

import { NEWS_TYPE_LABELS } from '@/entities/news/news.model';
import { NewsType } from '@/shared/sdk/news/news.schemas';
import { cn } from '@/shared/utils/cn';

const NEWS_TYPE_ICONS: Record<NewsType, LucideIcon> = {
  [NewsType.TECH_UPDATE]: WrenchIcon,
  [NewsType.INFO]: ScrollTextIcon,
  [NewsType.WEBSITE_UPDATE]: GlobeIcon,
};

export const NewsTypeBadge: FC<{ type: NewsType; className?: string }> = ({ type, className }) => {
  const Icon = NEWS_TYPE_ICONS[type] ?? ScrollTextIcon;

  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-full border border-lime-700/40 bg-lime-950/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lime-200',
        className,
      )}>
      <Icon className="size-3.5 shrink-0" />
      {NEWS_TYPE_LABELS[type]}
    </span>
  );
};
