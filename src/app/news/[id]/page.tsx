'use client';

import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import dayjs from 'dayjs';
import { ArrowLeftIcon } from 'lucide-react';

import { Layout } from '@/widgets/layout';
import { View } from '@/features/view';
import { Button } from '@/shared/ui/atoms/button';
import { ROUTES } from '@/shared/config/routes';
import { NewsAuthor, NewsTypeBadge } from '@/entities/news';
import { MessageContent } from '@/entities/comment/lexical-message';
import { MessageAttachments } from '@/entities/attachment/ui/message-attachments';
import { MissionCommentMessage } from '@/shared/sdk/api-model';
import { publicNewsPageState } from '../state/news-page.state';

const NewsDetailPage = observer(() => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  useEffect(() => {
    if (id) void publicNewsPageState.loadById(id);
  }, [id]);

  const news = publicNewsPageState.current;
  const isLoading = publicNewsPageState.detailLoader.isLoading;

  return (
    <Layout>
      <div className="w-full py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Button variant="ghost" size="sm" className="mb-6" onClick={() => router.push(ROUTES.weekends)}>
            <ArrowLeftIcon className="size-4" />
            До анонсів
          </Button>

          <View.Condition if={!isLoading} else={<div className="py-16 text-center text-zinc-400">Завантаження…</div>}>
            <View.Condition
              if={Boolean(news)}
              else={<div className="py-16 text-center text-zinc-500">Новину не знайдено</div>}>
              {news && (
                <article className="paper flex flex-col gap-6 rounded-2xl p-6 shadow-xl md:p-8">
                  <div className="flex flex-col gap-3">
                    <h1 className="text-3xl font-bold text-white md:text-4xl">{news.title}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                      <NewsTypeBadge type={news.type} />
                      <span className="text-sm text-zinc-500">{dayjs(news.date).format('DD.MM.YYYY')}</span>
                    </div>
                    {news.author && <NewsAuthor user={news.author} />}
                  </div>

                  {news.image?.url && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-black/40">
                      <Image
                        src={news.image.url}
                        alt={news.title}
                        fill
                        className="object-cover"
                        unoptimized={!news.image.url.startsWith('https')}
                      />
                    </div>
                  )}

                  <MessageContent message={news.content as MissionCommentMessage} />

                  <MessageAttachments attachments={news.attachments} />
                </article>
              )}
            </View.Condition>
          </View.Condition>
        </div>
      </div>
    </Layout>
  );
});

export default NewsDetailPage;
