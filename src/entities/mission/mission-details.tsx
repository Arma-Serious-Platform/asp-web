import { FC, ReactNode, useEffect, useState } from 'react';

import { UsersIcon, CalendarIcon, ShieldIcon, MapIcon, ClockIcon, CloudSunIcon } from 'lucide-react';
import { Card } from '@/shared/ui/atoms/card';
import classNames from 'classnames';
import { Game } from '@/shared/sdk/types';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import { toGameDate } from '@/shared/utils/date';
import { cn } from '@/shared/utils/cn';
import { UniformSection } from '@/entities/mission/uniform-section';
import { MissionSlotsSection } from '@/entities/mission/mission-slots-section';
import { WeaponrySection } from '@/entities/mission/weaponry-section';
import { ScreenshotPreviewDialog } from '@/shared/ui/moleculas/screenshot-preview-dialog';
import { MissionModel } from '@/entities/mission/mission.model';
import { SquadSideBadge } from '@/entities/side/ui/squad-side-badge';

type MissionDetailsProps = {
  game: Game;
};

type FactionPanelProps = {
  children: ReactNode;
  squadName?: string | null;
  squadType?: string | null;
};

const FactionPanel: FC<FactionPanelProps> = ({ children, squadName, squadType }) => (
  <div
    className={cn(
      'relative flex flex-col gap-2.5 rounded-lg border border-white/5 bg-black/30 p-3',
      squadName && 'pt-5',
    )}>
    <SquadSideBadge name={squadName} type={squadType} className="absolute -top-2.5 left-3" />
    {children}
  </div>
);

export const MissionDetailsHeader: FC<{ game: Game; className?: string }> = ({ game, className }) => (
  <div className={cn('flex flex-col items-start justify-between gap-4', className)}>
    <h2 className="inline-flex flex-wrap items-center gap-2 text-xl lg:text-3xl font-bold text-white leading-tight">
      <span>{game.mission.name}</span>
      {game.missionVersion?.version && (
        <span className="shrink-0 rounded border border-lime-500/40 bg-lime-950/40 px-2 py-1 text-xs font-semibold text-lime-200">
          {game.missionVersion.version}
        </span>
      )}
    </h2>
    {game.mission.missionObjective && (
      <span className="shrink-0 rounded border border-lime-500/40 bg-lime-950/40 px-2 py-1 text-xs font-semibold text-lime-200">
        {MissionModel.missionObjectiveLabels[game.mission.missionObjective]}
      </span>
    )}
  </div>
);

export const MissionDetails: FC<MissionDetailsProps> = ({ game }) => {
  const [isAttackWeaponryOpen, setIsAttackWeaponryOpen] = useState(true);
  const [isDefenseWeaponryOpen, setIsDefenseWeaponryOpen] = useState(true);
  const [isFriendlyWeaponryOpen, setIsFriendlyWeaponryOpen] = useState(true);
  const [isAttackUniformOpen, setIsAttackUniformOpen] = useState(true);
  const [isDefenseUniformOpen, setIsDefenseUniformOpen] = useState(true);
  const [isFriendlyUniformOpen, setIsFriendlyUniformOpen] = useState(true);
  const [isAttackSlotsOpen, setIsAttackSlotsOpen] = useState(false);
  const [isDefenseSlotsOpen, setIsDefenseSlotsOpen] = useState(false);
  const [isFriendlySlotsOpen, setIsFriendlySlotsOpen] = useState(false);
  const [previewScreenshots, setPreviewScreenshots] = useState<{ id: string; url: string }[]>([]);
  const [previewScreenshotIndex, setPreviewScreenshotIndex] = useState(0);

  const {
    attack: attackUniformScreenshots,
    defense: defenseUniformScreenshots,
    friendly: friendlyUniformScreenshots,
  } = MissionModel.resolveUniformScreenshots(game.missionVersion);
  const sideLabels = MissionModel.getMissionSideRoleLabels(game.mission.missionObjective);
  const attackColor = MissionModel.resolveMissionSideColor(game.missionVersion.attackSideType);
  const defenseColor = MissionModel.resolveMissionSideColor(game.missionVersion.defenseSideType);
  const friendlyColor = game.missionVersion.friendlySideType
    ? MissionModel.resolveMissionSideColor(game.missionVersion.friendlySideType)
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
    setIsAttackWeaponryOpen(true);
    setIsDefenseWeaponryOpen(true);
    setIsFriendlyWeaponryOpen(true);
    setIsAttackUniformOpen(true);
    setIsDefenseUniformOpen(true);
    setIsFriendlyUniformOpen(true);
    setIsAttackSlotsOpen(false);
    setIsDefenseSlotsOpen(false);
    setIsFriendlySlotsOpen(false);
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
      {/* Header — desktop only; mobile shows above image via MissionImagePanel */}
      <MissionDetailsHeader game={game} className="hidden lg:flex" />

      {(game.date || game.mission.island) && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {game.date && (
            <Card>
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4 text-lime-500" />
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  {toGameDate(game.date).locale('uk').format('dd, DD.MM.YYYY')}
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
        <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
          <FactionPanel squadName={game.attackSide?.name} squadType={game.attackSide?.type}>
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
            <WeaponrySection
              weaponry={attackWeaponry}
              isOpen={isAttackWeaponryOpen}
              setIsOpen={setIsAttackWeaponryOpen}
              sideType={game.missionVersion.attackSideType}
            />
            <UniformSection
              screenshots={attackUniformScreenshots}
              isOpen={isAttackUniformOpen}
              setIsOpen={setIsAttackUniformOpen}
              onPreview={handleOpenPreview}
            />
            <MissionSlotsSection
              slots={game.missionVersion.slots?.attack}
              isOpen={isAttackSlotsOpen}
              setIsOpen={setIsAttackSlotsOpen}
            />
          </FactionPanel>

          <FactionPanel squadName={game.defenseSide?.name} squadType={game.defenseSide?.type}>
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
            <WeaponrySection
              weaponry={defenseWeaponry}
              isOpen={isDefenseWeaponryOpen}
              setIsOpen={setIsDefenseWeaponryOpen}
              sideType={game.missionVersion.defenseSideType}
            />
            <UniformSection
              screenshots={defenseUniformScreenshots}
              isOpen={isDefenseUniformOpen}
              setIsOpen={setIsDefenseUniformOpen}
              onPreview={handleOpenPreview}
            />
            <MissionSlotsSection
              slots={game.missionVersion.slots?.defense}
              isOpen={isDefenseSlotsOpen}
              setIsOpen={setIsDefenseSlotsOpen}
            />
          </FactionPanel>
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
              <WeaponrySection
                weaponry={friendlyWeaponry}
                isOpen={isFriendlyWeaponryOpen}
                setIsOpen={setIsFriendlyWeaponryOpen}
                sideType={game.missionVersion.friendlySideType!}
              />
              <UniformSection
                screenshots={friendlyUniformScreenshots}
                isOpen={isFriendlyUniformOpen}
                setIsOpen={setIsFriendlyUniformOpen}
                onPreview={handleOpenPreview}
              />
              <MissionSlotsSection
                slots={game.missionVersion.slots?.friendly}
                isOpen={isFriendlySlotsOpen}
                setIsOpen={setIsFriendlySlotsOpen}
              />
            </div>
          </div>
        )}
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
