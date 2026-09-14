'use client';

import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dayjs from 'dayjs';

import { News } from '@/shared/sdk/news/news.schemas';
import { NEWS_TYPE_LABELS } from '@/entities/news';
import { ROUTES } from '@/shared/config/routes';
import { Card } from '@/shared/ui/atoms/card';
import { MessageContent } from '@/entities/comment/lexical-message';
import { UserNicknameText } from '@/entities/user/ui/user-text';
import { MissionCommentMessage } from '@/shared/sdk/api-model';

type NewsCardProps = {
  news: News;
};

export const NewsCard: FC<NewsCardProps> = ({ news }) => {
  return (
    <Link href={ROUTES.newsById(news.id)} className="block">
      <Card className="group transition-all duration-300 hover:border-lime-500/50 hover:shadow-lg hover:shadow-lime-500/10">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-black/40">
            <Image
              src={news.image?.url || '/images/logo.webp'}
              alt={news.title}
              fill
              className={
                news.image?.url
                  ? 'object-cover transition-transform duration-300 group-hover:scale-105'
                  : 'object-contain p-8'
              }
              unoptimized={!news.image?.url?.startsWith('https')}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute top-3 left-3">
              <span className="rounded border border-white/20 bg-black/40 px-2 py-1 text-xs font-semibold text-white">
                {NEWS_TYPE_LABELS[news.type]}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="line-clamp-2 text-xl font-bold text-white">{news.title}</h3>
            {news.shortDescription && (
              <MessageContent
                message={news.shortDescription as MissionCommentMessage}
                textOnly
                className="line-clamp-3 text-sm text-zinc-400 [&_p]:inline"
              />
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
              <span>{dayjs(news.date).format('DD.MM.YYYY')}</span>
              {news.author && (
                <UserNicknameText user={news.author} link={false} className="text-xs text-zinc-400" />
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
