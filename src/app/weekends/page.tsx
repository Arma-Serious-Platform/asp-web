'use client';

import { Layout } from '@/widgets/layout';
import { WeekendAnnouncement } from '@/app/weekends/ui/weekend-announcement';
import { NewsAnnouncement } from '@/app/weekends/ui/news-announcement';
import { observer } from 'mobx-react-lite';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { View } from '@/features/view';
import { News } from '@/shared/sdk/news/news.schemas';
import { Weekend } from '@/shared/sdk/weekends/weekends.schemas';

import { weekendsPageState } from './state/weekends-page.state';

const scrollToWeekendAnchor = (hash: string) => {
  const id = hash.replace(/^#/, '');
  if (!id) {
    return;
  }

  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const WeekendsPage = observer(() => {
  const searchParams = useSearchParams();
  const activeGameId = searchParams.get('game');

  useEffect(() => {
    weekendsPageState.init();
  }, []);

  useEffect(() => {
    if (weekendsPageState.pagination.preloader.isLoading) {
      return;
    }

    const scrollToHash = () => {
      requestAnimationFrame(() => {
        scrollToWeekendAnchor(window.location.hash);
      });
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);

    return () => {
      window.removeEventListener('hashchange', scrollToHash);
    };
  }, [activeGameId, weekendsPageState.pagination.preloader.isLoading, weekendsPageState.pagination.data.length]);

  return (
    <Layout>
      <div className="w-full py-8 md:py-12">
        <div className="container mx-auto">
          <div className="mx-auto mb-8 max-w-7xl px-4">
            <h1 className="mb-3 text-4xl font-bold text-white md:text-5xl">Анонси ігор</h1>
            <p className="text-lg text-zinc-400">Анонси ігрових подій та новини проєкту</p>
          </div>

          <View.Condition
            if={!weekendsPageState.pagination.preloader.isLoading}
            else={
              <div className="mx-auto flex max-w-7xl justify-center py-16">
                <div className="text-zinc-400">Завантаження…</div>
              </div>
            }>
            <div className="flex flex-col gap-12">
              {weekendsPageState.pagination.data.map(item => {
                if (item.type === 'weekends') {
                  return (
                    <WeekendAnnouncement
                      key={`weekends-${item.id}`}
                      weekend={item.data.data as Weekend}
                      activeGameId={activeGameId}
                    />
                  );
                }

                return <NewsAnnouncement key={`news-${item.id}`} news={item.data.data as News} />;
              })}
            </div>
          </View.Condition>

          <View.Condition
            if={!weekendsPageState.pagination.preloader.isLoading && weekendsPageState.pagination.data.length === 0}>
            <div className="mx-auto max-w-7xl py-16 text-center text-zinc-500">Немає опублікованих анонсів</div>
          </View.Condition>
        </div>
      </div>
    </Layout>
  );
});

export default WeekendsPage;
