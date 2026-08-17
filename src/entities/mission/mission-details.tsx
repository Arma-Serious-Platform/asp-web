import { FC, useEffect, useState } from 'react';

import { UsersIcon, CalendarIcon, ShieldIcon, MapIcon, ClockIcon, CloudSunIcon } from 'lucide-react';
import { Card } from '@/shared/ui/atoms/card';
import classNames from 'classnames';
import { Game, SideType } from '@/shared/sdk/types';
import dayjs from 'dayjs';
import { cn } from '@/shared/utils/cn';
import { UniformSection } from '@/entities/mission/uniform-section';
import { ScreenshotPreviewDialog } from '@/shared/ui/moleculas/screenshot-preview-dialog';
import { MissionModel } from '@/entities/mission/mission.model';

type MissionDetailsProps = {
  game: Game;
  attackSideType?: SideType;
  defenseSideType?: SideType;
};

export const MissionDetails: FC<MissionDetailsProps> = ({ game, attackSideType, defenseSideType }) => {
  const [isAttackUniformOpen, setIsAttackUniformOpen] = useState(true);
  const [isDefenseUniformOpen, setIsDefenseUniformOpen] = useState(true);
  const [isFriendlyUniformOpen, setIsFriendlyUniformOpen] = useState(true);
  const [previewScreenshots, setPreviewScreenshots] = useState<{ id: string; url: string }[]>([]);
  const [previewScreenshotIndex, setPreviewScreenshotIndex] = useState(0);

  const {
    attack: attackUniformScreenshots,
    defense: defenseUniformScreenshots,
    friendly: friendlyUniformScreenshots,
  } = MissionModel.resolveUniformScreenshots(game.missionVersion);
  const sideLabels = MissionModel.getMissionSideRoleLabels(game.mission.missionObjective);
  const resolvedAttackSideType = attackSideType ?? game.missionVersion.attackSideType;
  const resolvedDefenseSideType = defenseSideType ?? game.missionVersion.defenseSideType;
  const attackColor = MissionModel.resolveMissionSideColor(resolvedAttackSideType);
  const defenseColor = MissionModel.resolveMissionSideColor(resolvedDefenseSideType);
  const friendlyColor =
    game.missionVersion.friendlySideType != null
      ? game.missionVersion.friendlyTo === game.missionVersion.attackSideType
        ? attackColor
        : defenseColor
      : null;
  const previewScreenshotUrl = previewScreenshots?.[previewScreenshotIndex]?.url || null;
  const hasPreview = Boolean(previewScreenshotUrl);
  const hasVersionMeta = Boolean(game.missionVersion.inGameTime || game.missionVersion.weather);

  const attackWeaponry =
    game.missionVersion.weaponry?.filter(unit => unit.type === game.missionVersion.attackSideType) ?? [];
  const defenseWeaponry =
    game.missionVersion.weaponry?.filter(unit => unit.type === game.missionVersion.defenseSideType) ?? [];
  const friendlyWeaponry =
    game.missionVersion.friendlySideType != null
      ? (game.missionVersion.weaponry?.filter(unit => unit.type === game.missionVersion.friendlySideType) ?? [])
      : [];
  const hasFriendlySide =
    Boolean(game.missionVersion.friendlySideName) &&
    Boolean(game.missionVersion.friendlySideType) &&
    game.missionVersion.friendlySideSlots != null;

  useEffect(() => {
    setIsAttackUniformOpen(true);
    setIsDefenseUniformOpen(true);
    setIsFriendlyUniformOpen(true);
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
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-3xl font-bold text-white leading-tight">{game.mission.name}</h2>
        {game.mission.missionObjective && (
          <span className="shrink-0 rounded border border-lime-500/40 bg-lime-950/40 px-2 py-1 text-xs font-semibold text-lime-200">
            {MissionModel.missionObjectiveLabels[game.mission.missionObjective]}
          </span>
        )}
      </div>

      {(game.date || game.mission.island) && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {game.date && (
            <Card>
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4 text-lime-500" />
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  {dayjs(game.date).format('DD.MM.YYYY')}
                </span>
              </div>
            </Card>
          )}

          {game.mission.island && (
            <Card>
              <div className="flex items-center gap-2">
                <MapIcon className="size-4 text-lime-500" />
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  {game.mission.island.name}
                </span>
              </div>
            </Card>
          )}
        </div>
      )}

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

      {/* Sides + weaponry */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <ShieldIcon className="size-4 text-lime-500" />
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Фракції конфлікту</span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2.5 rounded-lg border border-white/5 bg-black/30 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className={classNames('w-2 h-2 rounded-full', attackColor.dot)} />
              <span className={classNames('font-bold text-base', attackColor.text)}>
                {game.missionVersion.attackSideName}
              </span>
              <span className={classNames('inline-flex items-center gap-1 text-sm font-medium', attackColor.text)}>
                <UsersIcon className="size-3.5" />
                {game.missionVersion.attackSideSlots}
              </span>
              <span className={classNames('px-2 py-0.5 rounded text-xs font-semibold', attackColor.soft)}>
                {sideLabels.attack}
              </span>
            </div>
            {attackWeaponry.map((unit, idx) => (
              <div key={idx} className="text-sm py-1 group hover:bg-white/5 rounded px-2 -mx-2 transition-colors">
                <span className={cn('text-sm', attackColor.accent)}>{unit.name}</span>{' '}
                <span className={cn(attackColor.text)}>×{unit.count}</span>{' '}
                {unit.description && <span className="text-zinc-500">({unit.description})</span>}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 rounded-lg border border-white/5 bg-black/30 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className={classNames('w-2 h-2 rounded-full', defenseColor.dot)} />
              <span className={classNames('font-bold text-base', defenseColor.text)}>
                {game.missionVersion.defenseSideName}
              </span>
              <span className={classNames('inline-flex items-center gap-1 text-sm font-medium', defenseColor.text)}>
                <UsersIcon className="size-3.5" />
                {game.missionVersion.defenseSideSlots}
              </span>
              <span className={classNames('px-2 py-0.5 rounded text-xs font-semibold', defenseColor.soft)}>
                {sideLabels.defense}
              </span>
            </div>
            {defenseWeaponry.map((unit, idx) => (
              <div key={idx} className="text-sm py-1 group hover:bg-white/5 rounded px-2 -mx-2 transition-colors">
                <span className={cn(defenseColor.accent)}>{unit.name}</span>{' '}
                <span className={cn(defenseColor.text)}>×{unit.count}</span>{' '}
                {unit.description && <span className="text-zinc-500">({unit.description})</span>}
              </div>
            ))}
          </div>
        </div>

        {hasFriendlySide && friendlyColor && (
          <div className="mt-4 flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Союзні фракції</span>
            <div className="flex flex-col gap-2.5 rounded-lg border border-white/5 bg-black/30 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className={classNames('w-2 h-2 rounded-full', friendlyColor.dot)} />
                <span className={classNames('font-bold text-base', friendlyColor.text)}>
                  {game.missionVersion.friendlySideName}
                </span>
                <span className={classNames('inline-flex items-center gap-1 text-sm font-medium', friendlyColor.text)}>
                  <UsersIcon className="size-3.5" />
                  {game.missionVersion.friendlySideSlots}
                </span>
              </div>
              <span className="text-xs text-zinc-500">
                на боці{' '}
                {game.missionVersion.friendlyTo === game.missionVersion.attackSideType
                  ? game.missionVersion.attackSideName
                  : game.missionVersion.defenseSideName}
              </span>
              {friendlyWeaponry.map((unit, idx) => (
                <div key={idx} className="text-sm py-1 group hover:bg-white/5 rounded px-2 -mx-2 transition-colors">
                  <span className={cn(friendlyColor.accent)}>{unit.name}</span>{' '}
                  <span className={cn(friendlyColor.text)}>×{unit.count}</span>{' '}
                  {unit.description && <span className="text-zinc-500">({unit.description})</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Уніформа</span>
        </div>
        <div
          className={cn(
            'grid grid-cols-1 gap-4',
            friendlyUniformScreenshots.length > 0 ? 'md:grid-cols-3' : 'md:grid-cols-2',
          )}>
          <div className="flex flex-col gap-2">
            <div className={cn('text-xs font-semibold uppercase tracking-wide mb-2 pb-2 border-b', attackColor.accent)}>
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

          {friendlyUniformScreenshots.length > 0 && friendlyColor && (
            <div className="flex flex-col gap-2">
              <div
                className={cn(
                  'text-xs font-semibold uppercase tracking-wide mb-2 pb-2 border-b',
                  friendlyColor.accent,
                )}>
                {game.missionVersion.friendlySideName}
              </div>
              <UniformSection
                screenshots={friendlyUniformScreenshots}
                isOpen={isFriendlyUniformOpen}
                setIsOpen={setIsFriendlyUniformOpen}
                onPreview={handleOpenPreview}
              />
            </div>
          )}
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
