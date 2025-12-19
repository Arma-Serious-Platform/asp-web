'use client';

import { Layout } from '@/widgets/layout';
import { dummyAnnouncements } from '@/features/weekend/model';
import { WeekendAnnouncement } from '@/entities/mission/weekend-announcement/ui';

export default function SchedulePage() {
  return (
    <Layout>
      <div className='w-full py-8 md:py-12'>
        <div className='container mx-auto px-4'>
          <div className='max-w-7xl mx-auto mb-8'>
            <h1 className='text-4xl md:text-5xl font-bold text-white mb-3 text-center'>
              Розклад ігор
            </h1>
            <p className='text-lg text-zinc-400 text-center'>
              Анонси ігрових подій та детальна інформація про сценарії
            </p>
          </div>

          {/* All Weekend Announcements */}
          <div className='flex flex-col gap-12'>
            {dummyAnnouncements.map((announcement) => (
              <WeekendAnnouncement
                key={announcement.id}
                announcement={announcement}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
