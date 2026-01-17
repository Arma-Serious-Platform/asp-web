import { FC } from 'react';
import { WeekendGame } from '@/features/weekend/model';
import { Button } from '@/shared/ui/atoms/button';
import { Card } from '@/shared/ui/atoms/card';
import { EyeIcon, DownloadIcon, CalendarIcon, InfoIcon, UserIcon } from 'lucide-react';

export const MissionImagePanel: FC<{
  game: WeekendGame;
  onView?: () => void;
  onDownload?: () => void;
}> = ({ game, onView, onDownload }) => {
  return (
    <div className="lg:w-2/5 flex flex-col gap-4">
      <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-white/10 group">
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Image Overlay Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 text-white">
            <CalendarIcon className="size-4" />
            {game.gameDate && <span className="text-sm font-semibold">{game.gameDate}</span>}
          </div>
        </div>

        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16">
          <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-lime-600 rounded-tr-lg" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="default" className="flex-1" onClick={onView || (() => console.log('View game:', game.id))}>
          <EyeIcon className="size-4" />
          Переглянути
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={onDownload || (() => console.log('Download game:', game.id))}>
          <DownloadIcon className="size-4" />
          Завантажити
        </Button>
      </div>

      {/* Author Card */}
      <Card className="p-3">
        <div className="flex items-center gap-3">
          <UserIcon className="size-4 text-lime-500" />
          <div className="flex items-center gap-0.5">
            <span className="text-red-500 font-semibold text-sm">{game.author.tag}</span>
            <span className="text-white text-sm">{game.author.name}</span>
          </div>
        </div>
      </Card>

      {/* Description Card */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <InfoIcon className="size-4 text-lime-500" />
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Опис сценарію</span>
        </div>
        <p className="text-sm text-zinc-200 leading-relaxed">{game.description}</p>
      </Card>
    </div>
  );
};
