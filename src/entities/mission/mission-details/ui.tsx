import { FC, useEffect, useState } from 'react';

import { CarIcon, UsersIcon, CalendarIcon, ShieldIcon, MapIcon, ClockIcon, CloudSunIcon } from 'lucide-react';
import { Card } from '@/shared/ui/atoms/card';
import classNames from 'classnames';
import { Game, SideType } from '@/shared/sdk/types';
import dayjs from 'dayjs';
import { cn } from '@/shared/utils/cn';
import { resolveMissionSideColor } from '@/entities/mission/mission-side-colors';
import { UniformSection } from '@/entities/mission/version/version-card/uniform-section';
import { resolveUniformScreenshots } from '@/entities/mission/version/version-card/lib';
import { ScreenshotPreviewDialog } from '@/shared/ui/moleculas/screenshot-preview-dialog';

type MissionDetailsProps = {
  game: Game;
  attackSideType?: SideType;
  defenseSideType?: SideType;
};

export const MissionDetails: FC<MissionDetailsProps> = ({ game, attackSideType, defenseSideType }) => {
  const [isAttackUniformOpen, setIsAttackUniformOpen] = useState(true);
  const [isDefenseUniformOpen, setIsDefenseUniformOpen] = useState(true);
  const [previewScreenshots, setPreviewScreenshots] = useState<{ id: string; url: string }[]>([]);
  const [previewScreenshotIndex, setPreviewScreenshotIndex] = useState(0);

  const { attack: attackUniformScreenshots, defense: defenseUniformScreenshots } = resolveUniformScreenshots(
    game.missionVersion,
  );
  const resolvedAttackSideType = attackSideType ?? game.missionVersion.attackSideType;
  const resolvedDefenseSideType = defenseSideType ?? game.missionVersion.defenseSideType;
  const attackColor = resolveMissionSideColor(resolvedAttackSideType);
  const defenseColor = resolveMissionSideColor(resolvedDefenseSideType);
  const previewScreenshotUrl = previewScreenshots?.[previewScreenshotIndex]?.url || null;
  const hasPreview = Boolean(previewScreenshotUrl);
  const hasVersionMeta = Boolean(game.missionVersion.inGameTime || game.missionVersion.weather);

  useEffect(() => {
    setIsAttackUniformOpen(true);
    setIsDefenseUniformOpen(true);
  }, [game.id]);

  const handleOpenPreview = (screenshots: { id: string; url: string }[], startIndex: number) => {
    setPreviewScreenshots(screenshots);
    setPreviewScreenshotIndex(startIndex);
  };

  const handleClosePreview = () => {
    setPreviewScreenshotIndex(0);
    setPreviewScreenshots([]);
  };

  const showPreviousScreenshot = () => {
    if (!previewScreenshots.length) return;
    setPreviewScreenshotIndex(prev => (prev === 0 ? previewScreenshots.length - 1 : prev - 1));
  };

  const showNextScreenshot = () => {
    if (!previewScreenshots.length) return;
    setPreviewScreenshotIndex(prev => (prev === previewScreenshots.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-3xl font-bold text-white leading-tight">{game.mission.name}</h2>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {game.date && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <CalendarIcon className="size-4" />
              <span>{dayjs(game.date).format('DD.MM.YYYY')}</span>
            </div>
          )}
          {game.mission.island && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <MapIcon className="size-4" />
              <span>{game.mission.island.name}</span>
            </div>
          )}
        </div>
      </div>

      {hasVersionMeta && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <ClockIcon className="size-4 text-lime-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Умови місії</span>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-zinc-300">
            {game.missionVersion.inGameTime && (
              <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-2">
                <ClockIcon className="size-4 text-lime-500" />
                <span>Ігровий час: {dayjs(game.missionVersion.inGameTime).format('HH:mm')}</span>
              </div>
            )}
            {game.missionVersion.weather && (
              <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-2">
                <CloudSunIcon className="size-4 text-lime-500" />
                <span>Погода: {game.missionVersion.weather}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Combatants Card */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <ShieldIcon className="size-4 text-lime-500" />
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Сторони конфлікту</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div
              className={classNames('w-2 h-2 rounded-full', attackColor.dot)}
            />
            <span
              className={classNames('font-bold text-base', attackColor.text)}>
              {game.missionVersion.attackSideName}
            </span>
            <span className="text-zinc-500 text-sm">({game.missionVersion.attackSideSlots})</span>
            <span className={classNames('px-2 py-0.5 rounded text-xs font-semibold', attackColor.soft)}>Атака</span>
          </div>
          <span className="text-zinc-500 font-bold">vs</span>
          <div className="flex items-center gap-2">
            <div
              className={classNames('w-2 h-2 rounded-full', defenseColor.dot)}
            />
            <span
              className={classNames('font-bold text-base', defenseColor.text)}>
              {game.missionVersion.defenseSideName}
            </span>
            <span className="text-zinc-500 text-sm">({game.missionVersion.defenseSideSlots})</span>
            <span className={classNames('px-2 py-0.5 rounded text-xs font-semibold', defenseColor.soft)}>Оборона</span>
          </div>
        </div>
      </Card>

      {/* Units Card */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <CarIcon className="size-4 text-lime-500" />
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Техніка та озброєння</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Side 1 Units */}
          <div className="flex flex-col gap-2.5">
            <div
              className={cn('text-xs font-semibold uppercase tracking-wide mb-2 pb-2 border-b', attackColor.accent)}>
              {game.missionVersion.attackSideName}
            </div>
            {game.missionVersion.weaponry
              ?.filter(unit => unit.type === game.missionVersion.attackSideType)
              .map((unit, idx) => (
                <div key={idx} className=" text-sm py-1 group hover:bg-white/5 rounded px-2 -mx-2 transition-colors">
                  <span
                    className={cn('text-sm', attackColor.accent)}>
                    {unit.name}
                  </span>{' '}
                  <span className="text-zinc-500">x{unit.count}</span>{' '}
                  {unit.description && <span className="text-zinc-500">({unit.description})</span>}
                </div>
              ))}
          </div>

          {/* Side 2 Units */}
          <div className="flex flex-col gap-2.5">
            <div
              className={classNames('text-xs font-semibold uppercase tracking-wide mb-2 pb-2 border-b', defenseColor.accent)}>
              {game.missionVersion.defenseSideName}
            </div>
            {game.missionVersion.weaponry
              ?.filter(unit => unit.type === game.missionVersion.defenseSideType)
              .map((unit, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm py-1 group hover:bg-white/5 rounded px-2 -mx-2 transition-colors">
                  <div className="flex-1 min-w-0">
                    <span
                      className={cn(defenseColor.accent)}>
                      {unit.name}
                    </span>{' '}
                    <span className="text-zinc-500">x{unit.count}</span>{' '}
                    {unit.description && <span className="text-zinc-500">({unit.description})</span>}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Уніформа</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div
              className={cn('text-xs font-semibold uppercase tracking-wide mb-2 pb-2 border-b', attackColor.accent)}>
              {game.missionVersion.attackSideName}
            </div>
            <UniformSection
              screenshots={attackUniformScreenshots}
              isOpen={isAttackUniformOpen}
              setIsOpen={setIsAttackUniformOpen}
              onPreview={handleOpenPreview}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div
              className={cn('text-xs font-semibold uppercase tracking-wide mb-2 pb-2 border-b', defenseColor.accent)}>
              {game.missionVersion.defenseSideName}
            </div>
            <UniformSection
              screenshots={defenseUniformScreenshots}
              isOpen={isDefenseUniformOpen}
              setIsOpen={setIsDefenseUniformOpen}
              onPreview={handleOpenPreview}
            />
          </div>
        </div>
      </Card>
      <ScreenshotPreviewDialog
        open={hasPreview}
        onOpenChange={open => !open && handleClosePreview()}
        imageUrl={previewScreenshotUrl}
        canNavigate={previewScreenshots.length > 1}
        onPrevious={showPreviousScreenshot}
        onNext={showNextScreenshot}
      />
    </div>
  );
};
