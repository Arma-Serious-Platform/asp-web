'use client';

import { Button } from '@/shared/ui/atoms/button';
import {
  CarIcon,
  EyeIcon,
  DownloadIcon,
  UsersIcon,
  InfoIcon,
  UserIcon,
} from 'lucide-react';
import { FC, useState } from 'react';
import { WeekendGame, dummyWeekendGames } from './model';
import classNames from 'classnames';

const GameTab: FC<{
  game: WeekendGame;
  index: number;
  isActive: boolean;
  onClick: () => void;
  isLast: boolean;
}> = ({ game, index, isActive, onClick, isLast }) => (
  <div className='relative flex'>
    <button
      onClick={onClick}
      className={classNames(
        'px-4 py-2 text-sm font-medium transition-colors border-b-2 relative z-10',
        {
          'bg-lime-700 text-white border-lime-600': isActive,
          'bg-neutral-800 text-white border-transparent hover:bg-neutral-700':
            !isActive,
        }
      )}>
      {index + 1}. {game.title}
    </button>
    {isActive && !isLast && (
      <div className='absolute right-0 top-0 bottom-0 w-[1px] bg-lime-600 z-20' />
    )}
  </div>
);

const GameDetails: FC<{ game: WeekendGame }> = ({ game }) => {
  const { side1, side2 } = game.combatants;

  return (
    <div className='flex flex-col gap-6'>
      {/* Title */}
      <h2 className='text-3xl font-bold text-white'>{game.title}</h2>

      {/* Combatants */}
      <div className='flex items-center gap-3'>
        <UsersIcon className='size-5 text-zinc-400' />
        <div className='flex items-center gap-2 flex-wrap'>
          <span
            className={classNames('font-semibold', {
              'text-red-500': side1.color === 'red',
              'text-blue-500': side1.color === 'blue',
            })}>
            {side1.name} ({side1.playerCount},{' '}
            {side1.role === 'attack' ? 'атака' : 'оборона'})
          </span>
          <span className='text-zinc-400'>vs</span>
          <span
            className={classNames('font-semibold', {
              'text-red-500': side2.color === 'red',
              'text-blue-500': side2.color === 'blue',
            })}>
            {side2.name} ({side2.playerCount},{' '}
            {side2.role === 'attack' ? 'атака' : 'оборона'})
          </span>
        </div>
      </div>

      {/* Unit Lists */}
      <div className='flex items-start gap-3'>
        <CarIcon className='size-5 text-zinc-400 mt-1' />
        <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Side 1 Units */}
          <div className='flex flex-col gap-2'>
            {side1.units.map((unit, idx) => (
              <div key={idx} className='text-sm'>
                <span className='text-white'>{unit.name}</span>
                {unit.details && (
                  <span className='text-zinc-400 ml-1'>{unit.details}</span>
                )}
                <span
                  className={classNames('ml-2 font-semibold', {
                    'text-red-500': side1.color === 'red',
                    'text-blue-500': side1.color === 'blue',
                  })}>
                  {unit.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Side 2 Units */}
          <div className='flex flex-col gap-2'>
            {side2.units.map((unit, idx) => (
              <div key={idx} className='text-sm'>
                <span className='text-white'>{unit.name}</span>
                {unit.details && (
                  <span className='text-zinc-400 ml-1'>{unit.details}</span>
                )}
                <span
                  className={classNames('ml-2 font-semibold', {
                    'text-red-500': side2.color === 'red',
                    'text-blue-500': side2.color === 'blue',
                  })}>
                  {unit.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className='flex items-start gap-3'>
        <InfoIcon className='size-5 text-zinc-400 mt-1' />
        <p className='text-sm text-zinc-200 leading-relaxed'>{game.description}</p>
      </div>

      {/* Author */}
      <div className='flex items-center gap-3'>
        <UserIcon className='size-5 text-zinc-400' />
        <div className='flex items-center gap-2'>
          <span className='text-red-500 font-semibold'>{game.author.tag}</span>
          <span className='text-white'>{game.author.name}</span>
        </div>
      </div>
    </div>
  );
};

const CompactGameDetails: FC<{ game: WeekendGame }> = ({ game }) => {
  const { side1, side2 } = game.combatants;

  return (
    <div className='flex flex-col gap-3'>
      {/* Title */}
      <h3 className='text-xl font-bold text-white'>{game.title}</h3>

      {/* Combatants */}
      <div className='flex items-center gap-2 text-xs'>
        <UsersIcon className='size-4 text-zinc-400' />
        <div className='flex items-center gap-2 flex-wrap'>
          <span
            className={classNames('font-semibold', {
              'text-red-500': side1.color === 'red',
              'text-blue-500': side1.color === 'blue',
            })}>
            {side1.name} ({side1.playerCount})
          </span>
          <span className='text-zinc-400'>vs</span>
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
      <p className='text-xs text-zinc-300 line-clamp-2 leading-relaxed'>
        {game.description}
      </p>
    </div>
  );
};

export const CompactWeekendGamesAnnouncement: FC = () => {
  const [activeGameIndex, setActiveGameIndex] = useState(0);
  const activeGame = dummyWeekendGames.games[activeGameIndex];

  return (
    <div className='w-full'>
      {/* Top Announcement Bar */}
      <div className='w-full bg-neutral-900/90 border-b border-white/10 py-1.5'>
        <div className='container mx-auto px-4'>
          <p className='text-center text-xs text-white'>
            Анонс ігор | {dummyWeekendGames.announcementDate}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className='w-full bg-neutral-800/90 border-b border-white/10'>
        <div className='container mx-auto px-4'>
          <div className='flex gap-0 overflow-x-auto'>
            {dummyWeekendGames.games.map((game, index) => (
              <GameTab
                key={game.id}
                game={game}
                index={index}
                isActive={activeGameIndex === index}
                isLast={index === dummyWeekendGames.games.length - 1}
                onClick={() => setActiveGameIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Compact */}
      <div className='w-full bg-gradient-to-br from-black/95 via-black/90 to-black/95 py-4'>
        <div className='container mx-auto px-4'>
          <div className='paper rounded-lg p-4'>
            <div className='flex flex-col md:flex-row gap-4'>
              {/* Left Panel - Image */}
              <div className='md:w-1/3'>
                <div className='relative w-full aspect-video overflow-hidden rounded-lg border border-white/10'>
                  <img
                    src={activeGame.image}
                    alt={activeGame.title}
                    className='w-full h-full object-cover'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                </div>
              </div>

              {/* Right Panel - Compact Details */}
              <div className='md:w-2/3 flex items-center'>
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
    <div className='w-full'>
      {/* Top Announcement Bar */}
      <div className='w-full bg-neutral-900/90 border-b border-white/10 py-2'>
        <div className='container mx-auto px-4'>
          <p className='text-center text-sm text-white'>
            Анонс ігор | {dummyWeekendGames.announcementDate}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className='w-full bg-neutral-800/90 border-b border-white/10'>
        <div className='container mx-auto px-4'>
          <div className='flex gap-0 overflow-x-auto'>
            {dummyWeekendGames.games.map((game, index) => (
              <GameTab
                key={game.id}
                game={game}
                index={index}
                isActive={activeGameIndex === index}
                isLast={index === dummyWeekendGames.games.length - 1}
                onClick={() => setActiveGameIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='w-full bg-gradient-to-br from-black/95 via-black/90 to-black/95 py-8'>
        <div className='container mx-auto px-4'>
          <div className='paper rounded-xl p-6 md:p-8'>
            <div className='flex flex-col lg:flex-row gap-6 lg:gap-8'>
              {/* Left Panel - Image and Actions */}
              <div className='lg:w-2/5 flex flex-col gap-4'>
                <div className='relative w-full aspect-video overflow-hidden rounded-lg border border-white/10'>
                  <img
                    src={activeGame.image}
                    alt={activeGame.title}
                    className='w-full h-full object-cover'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                </div>

                {/* Action Buttons */}
                <div className='flex gap-3'>
                  <Button
                    variant='secondary'
                    className='flex-1'
                    onClick={() => {
                      // Placeholder for view action
                      console.log('View game:', activeGame.id);
                    }}>
                    <EyeIcon className='size-4' />
                    Переглянути
                  </Button>
                  <Button
                    variant='secondary'
                    className='flex-1'
                    onClick={() => {
                      // Placeholder for download action
                      console.log('Download game:', activeGame.id);
                    }}>
                    <DownloadIcon className='size-4' />
                    Завантажити
                  </Button>
                </div>
              </div>

              {/* Right Panel - Game Details */}
              <div className='lg:w-3/5'>
                <GameDetails game={activeGame} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

