'use client';

import { FC, useState } from 'react';
import { WeekendGame, dummyWeekendGames } from './model';
import { MissionTabs } from '@/entities/mission/mission-tabs/ui';
import { MissionDetails } from '@/entities/mission/mission-details/ui';
import { MissionImagePanel } from '@/entities/mission/mission-image-panel/ui';
import { UsersIcon } from 'lucide-react';
import classNames from 'classnames';

const CompactGameDetails: FC<{ game: WeekendGame }> = ({ game }) => {
  const { side1, side2 } = game.combatants;

  return (
    <div className="flex flex-col gap-3">
      {/* Title */}
      <h3 className="text-xl font-bold text-white">{game.title}</h3>

      {/* Combatants */}
      <div className="flex items-center gap-2 text-xs">
        <UsersIcon className="size-4 text-zinc-400" />
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={classNames('font-semibold', {
              'text-red-500': side1.color === 'red',
              'text-blue-500': side1.color === 'blue',
            })}>
            {side1.name} ({side1.playerCount})
          </span>
          <span className="text-zinc-400">vs</span>
          <span
            className={classNames('font-semibold', {
              'text-red-500': side2.color === 'red',
              'text-blue-500': side2.color === 'blue',
            })}>
            {side2.name} ({side2.playerCount})
          </span>
        </div>
      </div>

      {/* Description (truncated) */}
      <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">{game.description}</p>
    </div>
  );
};

export const CompactWeekendGamesAnnouncement: FC = () => {
  const [activeGameIndex, setActiveGameIndex] = useState(0);
  const activeGame = dummyWeekendGames.games[activeGameIndex];

  return (
    <div className="w-full">
      {/* Top Announcement Bar */}
      <div className="w-full bg-neutral-900/90 border-b border-white/10 py-1.5">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs text-white">Анонс ігор | {dummyWeekendGames.announcementDate}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <MissionTabs games={dummyWeekendGames.games} activeIndex={activeGameIndex} onGameChange={setActiveGameIndex} />

      {/* Main Content - Compact */}
      <div className="w-full bg-gradient-to-br from-black/95 via-black/90 to-black/95 py-4">
        <div className="container mx-auto px-4">
          <div className="paper rounded-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Left Panel - Image */}
              <div className="md:w-1/3">
                <div className="relative w-full aspect-video overflow-hidden rounded-lg border border-white/10">
                  <img src={activeGame.image} alt={activeGame.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              </div>

              {/* Right Panel - Compact Details */}
              <div className="md:w-2/3 flex items-center">
                <CompactGameDetails game={activeGame} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WeekendGamesAnnouncement: FC = () => {
  const [activeGameIndex, setActiveGameIndex] = useState(0);
  const activeGame = dummyWeekendGames.games[activeGameIndex];

  return (
    <div className="w-full">
      {/* Top Announcement Bar */}
      <div className="w-full bg-neutral-900/90 border-b border-white/10 py-2">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-white">Анонс ігор | {dummyWeekendGames.announcementDate}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <MissionTabs games={dummyWeekendGames.games} activeIndex={activeGameIndex} onGameChange={setActiveGameIndex} />

      {/* Main Content */}
      <div className="w-full bg-gradient-to-br from-black/95 via-black/90 to-black/95 py-8">
        <div className="container mx-auto px-4">
          <div className="paper rounded-xl p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Left Panel - Image and Actions */}
              <MissionImagePanel game={activeGame} />

              {/* Right Panel - Game Details */}
              <div className="lg:w-3/5">
                <MissionDetails game={activeGame} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
