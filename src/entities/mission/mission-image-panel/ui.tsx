import { FC } from 'react';
import { WeekendGame } from '@/features/weekend/model';
import { Button } from '@/shared/ui/atoms/button';
import { EyeIcon, DownloadIcon } from 'lucide-react';

export const MissionImagePanel: FC<{
  game: WeekendGame;
  onView?: () => void;
  onDownload?: () => void;
}> = ({ game, onView, onDownload }) => {
  return (
    <div className='lg:w-2/5 flex flex-col gap-4'>
      <div className='relative w-full aspect-video overflow-hidden rounded-lg border border-white/10'>
        <img
          src={game.image}
          alt={game.title}
          className='w-full h-full object-cover'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
      </div>

      {/* Action Buttons */}
      <div className='flex gap-3'>
        <Button
          variant='secondary'
          className='flex-1'
          onClick={onView || (() => console.log('View game:', game.id))}>
          <EyeIcon className='size-4' />
          Переглянути
        </Button>
        <Button
          variant='secondary'
          className='flex-1'
          onClick={onDownload || (() => console.log('Download game:', game.id))}>
          <DownloadIcon className='size-4' />
          Завантажити
        </Button>
      </div>
    </div>
  );
};

