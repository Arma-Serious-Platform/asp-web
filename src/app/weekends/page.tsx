'use client';

import { Layout } from '@/widgets/layout';
import { WeekendAnnouncement } from '@/entities/weekend/weekend-announcement/ui';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { model } from './model';
import { View } from '@/features/view';
import { api } from '@/shared/sdk';
import { Side } from '@/shared/sdk/types';

const WeekendsPage = observer(() => {
  const [sidesById, setSidesById] = useState<Record<string, Side>>({});

  useEffect(() => {
    model.init();
  }, []);

  useEffect(() => {
    const loadSides = async () => {
      try {
        const sidesRes = await api.findSides({ take: 1000, skip: 0 });
        const sides = sidesRes.data.data ?? [];
        setSidesById(Object.fromEntries(sides.map(side => [side.id, side])));
      } catch (error) {
        console.error(error);
      }
    };

    void loadSides();
  }, []);

  return (
    <Layout>
      <div className="w-full py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 text-center">Анонси ігор</h1>
            <p className="text-lg text-zinc-400 text-center">
              Анонси ігрових подій та детальна інформація про сценарії
            </p>
          </div>

          <View.Condition
            if={!model.weekends.pagination.preloader.isLoading}
            else={
              <div className="max-w-7xl mx-auto flex justify-center py-16">
                <div className="text-zinc-400">Завантаження…</div>
              </div>
            }>
            <div className="flex flex-col gap-12">
              {model.weekends.pagination.data.map(weekend => (
                <WeekendAnnouncement key={weekend.id} weekend={weekend} sidesById={sidesById} />
              ))}
            </div>
          </View.Condition>

          <View.Condition
            if={!model.weekends.pagination.preloader.isLoading && model.weekends.pagination.data.length === 0}>
            <div className="max-w-7xl mx-auto text-center text-zinc-500 py-16">Немає опублікованих анонсів</div>
          </View.Condition>
        </div>
      </div>
    </Layout>
  );
});

export default WeekendsPage;
