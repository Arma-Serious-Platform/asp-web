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
    <div className='w-full paper'>
      {/* Top Announcement Bar */}
      <div className='w-full py-2'>
        <div className='container mx-auto px-4'>
          <p className='text-center text-sm text-white'>
            Анонс ігор | {announcement.announcementDate}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <MissionTabs
        games={announcement.games}
        activeIndex={activeGameIndex}
        onGameChange={setActiveGameIndex}
      />

      {/* Main Content */}
      <div className='w-full bg-gradient-to-br from-black/95 via-black/90 to-black/95 py-8'>
        <div className='container mx-auto px-4'>
          <div className='paper rounded-xl p-6 md:p-8'>
            <div className='flex flex-col lg:flex-row gap-6 lg:gap-8'>
              {/* Left Panel - Image and Actions */}
              <MissionImagePanel game={activeGame} />

              {/* Right Panel - Game Details */}
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

