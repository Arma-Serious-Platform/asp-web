'use client';

import { FC, useState } from 'react';
import { MissionImagePanel } from '@/entities/mission/mission-image-panel/ui';
import { MissionDetails } from '@/entities/mission/mission-details/ui';
import { Tab } from '@/shared/ui/moleculas/tab';
import { Weekend } from '@/shared/sdk/types';
import dayjs from 'dayjs';

export const WeekendAnnouncement: FC<{
  weekend: Weekend;
}> = ({ weekend }) => {
  const [activeGameIndex, setActiveGameIndex] = useState(0);

  // Sort games by position to ensure correct order
  const sortedGames = weekend.games ? [...weekend.games].sort((a, b) => a.position - b.position) : [];

  const activeGame = sortedGames[activeGameIndex];

  return (
    <div className="w-full mb-8">
      {/* Top Announcement Bar */}

      {/* Combined Tabs and Content Card */}
      <div className="w-full container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 paper rounded-t-2xl rounded-b-none h-16 mx-auto px-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-lime-700/50 to-transparent" />
          <div className="flex flex-col gap-1">
            <p className="text-xl font-semibold text-white whitespace-nowrap">{weekend.name}</p>
            <p className="text-xs font-semibold text-white whitespace-nowrap">{weekend.description}</p>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-lime-700/50 to-transparent" />
        </div>
        <div className="paper rounded-b-2xl rounded-t-none overflow-hidden shadow-xl border-lime-700/20 border-t-none">
          {/* Navigation Tabs - Connected to card */}
          <div className="w-full bg-black/40 border-b border-white/10 backdrop-blur-sm">
            <div className="flex justify-center items-center gap-0 overflow-x-auto w-full">
              {sortedGames.map((game, index) => (
                <Tab
                  key={game.id}
                  className="w-full justify-center items-center"
                  title={game.mission?.name || `Гра ${index + 1} ${dayjs(game.date).format('DD.MM')}`}
                  index={index}
                  isActive={activeGameIndex === index}
                  onClick={() => setActiveGameIndex(index)}
                />
              ))}
            </div>
          </div>

          {/* Main Content */}
          {activeGame && (
            <div className="p-6 md:p-8">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Left Panel - Image and Actions */}
                <MissionImagePanel game={activeGame} />

                {/* Right Panel - Mission Details */}
                <div className="lg:w-3/5">
                  <MissionDetails game={activeGame} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
