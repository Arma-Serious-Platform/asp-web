'use client';

import { FC, useState } from 'react';
import { GameAnnouncement } from '@/features/weekend/model';
import { MissionImagePanel } from '../mission-image-panel/ui';
import { MissionDetails } from '../mission-details/ui';
import { Tab } from '@/shared/ui/moleculas/tab';

export const WeekendAnnouncement: FC<{
  announcement: GameAnnouncement;
}> = ({ announcement }) => {
  const [activeGameIndex, setActiveGameIndex] = useState(0);
  const activeGame = announcement.games[activeGameIndex];

  return (
    <div className='w-full mb-8'>
      {/* Top Announcement Bar */}

      {/* Combined Tabs and Content Card */}
      <div className='w-full container mx-auto px-4'>
        <div className='flex items-center justify-center gap-2 paper rounded-t-2xl rounded-b-none h-16 mx-auto px-4'>
          <div className='h-px flex-1 bg-gradient-to-r from-transparent via-lime-700/50 to-transparent' />
          <p className='text-sm font-semibold text-white whitespace-nowrap'>
            Анонс ігор | {announcement.announcementDate}
          </p>
          <div className='h-px flex-1 bg-gradient-to-r from-transparent via-lime-700/50 to-transparent' />
        </div>
        <div className='paper rounded-b-2xl rounded-t-none overflow-hidden shadow-xl border-lime-700/20 border-t-none'>
          {/* Navigation Tabs - Connected to card */}
          <div className='w-full bg-black/40 border-b border-white/10 backdrop-blur-sm'>
            <div className='flex gap-0 overflow-x-auto w-full'>
              {announcement.games.map((game, index) => (
                <Tab
                  key={game.id}
                  className='w-full'
                  title={game.title}
                  index={index}
                  isActive={activeGameIndex === index}
                  onClick={() => setActiveGameIndex(index)}
                />
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className='p-6 md:p-8'>
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
