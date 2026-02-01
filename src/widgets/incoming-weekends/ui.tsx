'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Link } from '@/shared/ui/atoms/link';
import { ROUTES } from '@/shared/config/routes';

import { FC, useEffect } from 'react';
import { CalendarIcon, ArrowRightIcon } from 'lucide-react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { IncomingWeekendsModel } from './model';
import { MissionGameSide } from '@/shared/sdk/types';

export const IncomingWeekends: FC<{
  model: IncomingWeekendsModel;
}> = observer(({ model }) => {
  useEffect(() => {
    model.init();
  }, []);

  return (
    <div className="w-full relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/90 to-black/95" />
      <div
        className='absolute inset-0 bg-[url("/images/hero.jpg")] bg-cover bg-center bg-no-repeat opacity-10'
        style={{ backgroundAttachment: 'fixed' }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-lime-700/5 via-transparent to-lime-700/5" />

      {/* Content */}
      <div className="relative z-10 w-full py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="paper rounded-xl p-4 md:p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
                  <CalendarIcon className="size-4" />
                  <span>{model.weekends.pagination.data[0]?.name ?? ''}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white">Найближчі ігри</h2>
              </div>
              <Link href={ROUTES.weekends}>
                <Button variant="outline" size="sm">
                  Всі анонси
                  <ArrowRightIcon className="size-4" />
                </Button>
              </Link>
            </div>

            {/* Games Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {model.weekends.pagination.data[0]?.games?.slice(0, 2).map(game => (
                <div
                  key={game.id}
                  className="paper rounded-lg p-4 border border-white/10 hover:border-lime-700/50 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Game Image */}
                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border border-white/10 shrink-0">
                      <img
                        src={game.mission.image?.url ?? ''}
                        alt={game.mission.name ?? ''}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-1 left-1 right-1">
                        <span className="text-xs font-semibold text-white">{game.date === 'Friday' ? 'Пт' : 'Нд'}</span>
                      </div>
                    </div>

                    {/* Game Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-white mb-1.5 truncate">{game.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2 flex-wrap">
                        <span
                          className={classNames('font-semibold', {
                            'text-red-500': game.missionVersion.attackSideType === MissionGameSide.RED,
                            'text-blue-500': game.missionVersion.attackSideType === MissionGameSide.BLUE,
                          })}>
                          {game.missionVersion.attackSideName}
                        </span>
                        <span>vs</span>
                        <span
                          className={classNames('font-semibold', {
                            'text-red-500': game.missionVersion.defenseSideType === MissionGameSide.RED,
                            'text-blue-500': game.missionVersion.defenseSideType === MissionGameSide.BLUE,
                          })}>
                          {game.missionVersion.defenseSideName}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 line-clamp-2">{game.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
