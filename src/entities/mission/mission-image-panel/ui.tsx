import { FC } from 'react';
import { Button } from '@/shared/ui/atoms/button';
import { Card } from '@/shared/ui/atoms/card';
import { EyeIcon, DownloadIcon, CalendarIcon, InfoIcon, UserIcon, UserRoundCog } from 'lucide-react';
import { Game } from '@/shared/sdk/types';
import dayjs from 'dayjs';
import Link from 'next/link';
import { ROUTES } from '@/shared/config/routes';
import { UserNicknameText } from '@/entities/user/ui/user-text';
import { MissionAuthorsText } from '@/entities/mission/mission-authors-text';

export const MissionImagePanel: FC<{
  game: Game;
  showDescription?: boolean;
}> = ({ game, showDescription = true }) => {
  return (
    <div className="lg:w-2/5 flex flex-col gap-4">
      <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-white/10 group">
        <img
          src={game.mission.image?.url ?? ''}
          alt={game.mission.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

        {/* Image Overlay Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 text-white">
            <CalendarIcon className="size-4" />
            {game.date && <span className="text-sm font-semibold">{dayjs(game.date).format('DD.MM.YYYY')}</span>}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button asChild variant="default" className="flex-1">
          <Link className="hover:text-white" href={ROUTES.missions.id(game.mission.id)}>
            <EyeIcon className="size-4" />
            Переглянути
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href={game.missionVersion.file?.url ?? ''} download>
            <DownloadIcon className="size-4" />
            Завантажити
          </Link>
        </Button>
      </div>

      {/* Author & game admin */}
      <Card className="p-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-3">
            <UserIcon className="mt-0.5 size-4 shrink-0 text-lime-500" />
            <div className="min-w-0">
              <MissionAuthorsText
                mission={game.mission}
                className="text-sm text-zinc-500"
                userClassName="text-zinc-200"
              />
            </div>
          </div>
          {game.admin && (
            <div className="flex items-start gap-3 border-t border-white/10 pt-2">
              <UserRoundCog className="mt-0.5 size-4 shrink-0 text-lime-500" />
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  Ігровий адміністратор
                </div>
                <UserNicknameText user={game.admin} className="text-sm text-zinc-200" />
              </div>
            </div>
          )}
        </div>
      </Card>

      {showDescription && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <InfoIcon className="size-4 text-lime-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Опис сценарію</span>
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed">{game.mission.description}</p>
        </Card>
      )}
    </div>
  );
};
