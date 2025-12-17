import { FC } from 'react';
import { WeekendGame } from '@/features/weekend/model';
import { Tab } from '@/shared/ui/moleculas/tab';

export const MissionTabs: FC<{
  games: WeekendGame[];
  activeIndex: number;
  onGameChange: (index: number) => void;
}> = ({ games, activeIndex, onGameChange }) => {
  return (
    <div className='w-full bg-neutral-800/90 border-b border-white/10'>
      <div className='container mx-auto px-4'>
        <div className='flex gap-0 overflow-x-auto'>
          {games.map((game, index) => (
            <Tab
              key={game.id}
              title={game.title}
              index={index}
              isActive={activeIndex === index}
              isLast={index === games.length - 1}
              onClick={() => onGameChange(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

