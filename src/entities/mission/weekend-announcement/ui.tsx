'use client';

import { FC, useState } from 'react';
import { GameAnnouncement } from '@/features/weekend/model';
import { MissionTabs } from '../mission-tabs/ui';
import { MissionImagePanel } from '../mission-image-panel/ui';
import { MissionDetails } from '../mission-details/ui';

export const WeekendAnnouncement: FC<{
  announcement: GameAnnouncement;
}> = ({ announcement }) => {
  const [activeGameIndex, setActiveGameIndex] = useState(0);
  const activeGame = announcement.games[activeGameIndex];

  return (
    <div className='w-full mb-8'>
      {/* Top Announcement Bar */}
      <div className='w-full bg-black/40 border-b border-lime-700/30 py-3 backdrop-blur-sm'>
        <div className='container mx-auto px-4'>
          <div className='flex items-center justify-center gap-2'>
            <div className='h-px flex-1 bg-gradient-to-r from-transparent via-lime-700/50 to-transparent' />
            <p className='text-sm font-semibold text-white whitespace-nowrap'>
              Анонс ігор | {announcement.announcementDate}
            </p>
            <div className='h-px flex-1 bg-gradient-to-r from-transparent via-lime-700/50 to-transparent' />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <MissionTabs
        games={announcement.games}
        activeIndex={activeGameIndex}
        onGameChange={setActiveGameIndex}
      />

      {/* Main Content */}
      <div className='w-full py-8'>
        <div className='container mx-auto px-4'>
          <div className='paper rounded-2xl p-6 md:p-8 shadow-xl border-lime-700/20'>
            <div className='flex flex-col lg:flex-row gap-6 lg:gap-8'>
              {/* Left Panel - Image and Actions */}
              <MissionImagePanel game={activeGame} />

              {/* Right Panel - Mission Details */}
              <div className='lg:w-3/5'>
                <MissionDetails game={activeGame} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
