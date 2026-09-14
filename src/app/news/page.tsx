'use client';

import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { Layout } from '@/widgets/layout';
import { View } from '@/features/view';
import { Button } from '@/shared/ui/atoms/button';
import { publicNewsPageState } from './state/news-page.state';
import { NewsCard } from './ui/news-card';

const NewsPage = observer(() => {
  useEffect(() => {
    void publicNewsPageState.loadList();
  }, []);

  const { pagination } = publicNewsPageState;
  const isLoading = pagination.preloader.isLoading || pagination.loader.isLoading;
  const hasMore = pagination.data.length < pagination.total;

  return (
    <Layout>
      <div className="w-full py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-8 max-w-7xl">
            <h1 className="mb-3 text-center text-4xl font-bold text-white md:text-5xl">Новини</h1>
            <p className="text-center text-lg text-zinc-400">Оголошення проєкту та технічні оновлення</p>
          </div>

          <View.Condition
            if={!pagination.preloader.isLoading}
            else={
              <div className="mx-auto flex max-w-7xl justify-center py-16">
                <div className="text-zinc-400">Завантаження…</div>
              </div>
            }>
            <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pagination.data.map(item => (
                <NewsCard key={item.id} news={item.data} />
              ))}
            </div>
          </View.Condition>

          <View.Condition if={!pagination.preloader.isLoading && pagination.data.length === 0}>
            <div className="mx-auto max-w-7xl py-16 text-center text-zinc-500">Немає опублікованих новин</div>
          </View.Condition>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="secondary"
                disabled={isLoading}
                onClick={() => void pagination.loadMore()}>
                {isLoading ? 'Завантаження…' : 'Показати ще'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
});

export default NewsPage;
