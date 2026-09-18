'use client';

import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dayjs from 'dayjs';

import { News } from '@/shared/sdk/news/news.schemas';
import { NewsAuthor, NewsTypeBadge } from '@/entities/news';
import { ROUTES } from '@/shared/config/routes';
import { MessageContent } from '@/entities/comment/lexical-message';
import { MissionCommentMessage } from '@/shared/sdk/api-model';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/ui/atoms/button';
import { EyeIcon } from 'lucide-react';

export const NewsAnnouncement: FC<{ news: News }> = ({ news }) => {
  return (
    <div id={news.id} className="mb-8 w-full scroll-mt-24">
      <div className="container mx-auto w-full px-4">
        <div className="paper mx-auto flex min-h-16 items-center justify-center gap-2 rounded-t-2xl rounded-b-none px-4 py-2">
          <div className="h-px flex-1 bg-linear-to-r from-transparent via-lime-700/50 to-transparent" />
          <div className="flex min-w-0 flex-col items-center gap-1 text-center">
            <p className="truncate text-xl font-semibold whitespace-nowrap text-white group-hover:text-lime-200">
              {news.title}
            </p>
            <div className="flex items-center gap-2">
              <NewsTypeBadge type={news.type} />
              <span className="text-xs font-semibold whitespace-nowrap text-white/70">
                {dayjs(news.date).format('DD.MM.YYYY')}
              </span>

              {news.author && <NewsAuthor user={news.author} link={false} className="mt-auto text-zinc-500" />}
            </div>
          </div>
          <div className="h-px flex-1 bg-linear-to-r from-transparent via-lime-700/50 to-transparent" />
        </div>

        <div className="paper overflow-hidden rounded-b-2xl rounded-t-none border-t-none border-lime-700/20 shadow-xl transition-colors group-hover:border-lime-500/40">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
              {news.image?.url && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-black/40 lg:w-2/5">
                  <Image
                    src={news.image.url}
                    alt={news.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized={!news.image.url.startsWith('https')}
                  />
                </div>
              )}

              <div className={cn('flex min-w-0 flex-1 flex-col gap-3', news.image?.url && 'lg:w-3/5')}>
                {news.shortDescription && (
                  <MessageContent
                    message={news.shortDescription as MissionCommentMessage}
                    className="line-clamp-6 text-base text-zinc-300"
                  />
                )}

                <Link href={ROUTES.newsById(news.id)} className="w-fit">
                  <Button className="w-full">
                    <EyeIcon className="size-4" />
                    Читати далі
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
