'use client';

import { FC } from 'react';
import { PlusIcon } from 'lucide-react';
import { Mission, MissionStatus, MissionVersion } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { MissionVersionCard } from '@/app/missions/[id]/ui/version-card';
import { View } from '@/features/view';

type VersionsSectionProps = {
  mission: Mission;
  missionId: string;
  canEditMissionVersion: boolean;
  canDeleteMissionVersion: boolean;
  canChangeMissionVersionStatus: boolean;
  isMissionArchived: boolean;
  onCreateVersion: () => void;
  onEditVersion: (version: MissionVersion) => void;
  onDeleteVersion: (version: MissionVersion) => void;
  onChangeStatus: (params: { missionId: string; version: MissionVersion; status: MissionStatus }) => void;
};

export const VersionsSection: FC<VersionsSectionProps> = ({
  mission,
  missionId,
  canEditMissionVersion,
  canDeleteMissionVersion,
  canChangeMissionVersionStatus,
  isMissionArchived,
  onCreateVersion,
  onEditVersion,
  onDeleteVersion,
  onChangeStatus,
}) => {
  const latestVersion = mission.missionVersions?.[0];
  const versions = mission.missionVersions ?? [];

  return (
    <>
      {latestVersion && (
        <div key={latestVersion.id} className="border-t border-white/10 pt-6">
          {latestVersion.version && (
            <h2 className="mb-4 text-xl font-bold text-white">Остання версія: {latestVersion.version}</h2>
          )}
          <MissionVersionCard
            fullWidth
            version={latestVersion}
            missionId={missionId}
            missionObjective={mission.missionObjective}
            canEdit={canEditMissionVersion}
            canDelete={canDeleteMissionVersion}
            canChangeStatus={canChangeMissionVersionStatus}
            defaultSectionsOpen
            onEdit={onEditVersion}
            onDelete={onDeleteVersion}
            onChangeStatus={onChangeStatus}
          />
        </div>
      )}

      <div className="border-t border-white/10 pt-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Версії місії</h2>
            {isMissionArchived && (
              <p className="mt-1 text-sm text-zinc-500">
                Місія в архіві: створення та редагування версій недоступне.
              </p>
            )}
          </div>
          <View.Condition if={canEditMissionVersion}>
            <Button variant="default" onClick={onCreateVersion}>
              <PlusIcon className="size-4" />
              Створити версію
            </Button>
          </View.Condition>
        </div>

        {versions.length === 0 ? (
          <div className="paper flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-8 text-center">
            <p className="text-zinc-400">Версій поки немає</p>
            <View.Condition if={canEditMissionVersion}>
              <Button variant="default" onClick={onCreateVersion}>
                <PlusIcon className="size-4" />
                Створити першу версію
              </Button>
            </View.Condition>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {versions.map(version => (
              <MissionVersionCard
                key={version.id}
                fullWidth
                canEdit={canEditMissionVersion}
                canDelete={canDeleteMissionVersion}
                canChangeStatus={canChangeMissionVersionStatus}
                version={version}
                missionId={missionId}
                missionObjective={mission.missionObjective}
                onEdit={onEditVersion}
                onDelete={onDeleteVersion}
                onChangeStatus={onChangeStatus}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};
