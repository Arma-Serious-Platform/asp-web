'use client';

import { Layout } from '@/widgets/layout';
import { WeekendAnnouncement } from '@/entities/weekend/weekend-announcement/ui';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { weekendsPageModel } from './model';

const SchedulePage = observer(function SchedulePage() {
  useEffect(() => {
    weekendsPageModel.init();
  }, []);

  const { announcements, isLoading, error } = weekendsPageModel;

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

          {error && (
            <div className="max-w-7xl mx-auto mb-6 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-center">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="max-w-7xl mx-auto flex justify-center py-16">
              <div className="text-zinc-400">Завантаження…</div>
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              {announcements.map(announcement => (
                <WeekendAnnouncement key={announcement.id} announcement={announcement} />
              ))}
            </div>
          )}

          {!isLoading && !error && announcements.length === 0 && (
            <div className="max-w-7xl mx-auto text-center text-zinc-500 py-16">
              Немає опублікованих анонсів
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
});

export default SchedulePage;
