import { Button } from '@/shared/ui/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/organisms/dialog';
import { observer } from 'mobx-react-lite';
import { FC, PropsWithChildren } from 'react';
import { ChangeMissionVersionStatusState } from '../state/change-mission-status.state';
import { MissionStatus } from '@/shared/sdk/types';
import { View } from '@/features/view';
import { MissionModel } from '@/entities/mission/mission.model';

const ChangeMissionVersionStatusModal: FC<
  PropsWithChildren<{
    state?: ChangeMissionVersionStatusState;
    model?: ChangeMissionVersionStatusState;
    onSuccess?: (status: MissionStatus) => void;
  }>
> = observer(({ state: stateProp, model, children, onSuccess }) => {
  const state = stateProp ?? model;
  if (!state) return null;

  const status = state.visibility?.payload?.status;
  const version = state.visibility?.payload?.version;
  const missionId = state.visibility?.payload?.missionId;

  const isApproveAction = status === MissionStatus.APPROVED;
  const isChangesRequestedAction = status === MissionStatus.CHANGES_REQUESTED;
  const isPendingApprovalAction = status === MissionStatus.PENDING_APPROVAL;
  const isInReviewAction = status === MissionStatus.IN_REVIEW;
  const isPendingGameApprovalAction = status === MissionStatus.PENDING_GAME_APPROVAL;

  return (
    <Dialog open={state.visibility.isOpen} onOpenChange={state.visibility.switch}>
      <DialogOverlay />
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <View.Condition if={isApproveAction}>
              <div>
                Ви впевнені, що хочете допустити версію місії <span className="text-primary">{version?.version}</span>{' '}
                до ігор?
              </div>
            </View.Condition>
            <View.Condition if={isPendingApprovalAction}>
              <div>
                Ви впевнені, що хочете перевести версію <span className="text-primary">{version?.version}</span> в
                статус <span className="text-primary">{MissionModel.statusLabels[MissionStatus.PENDING_APPROVAL]}</span>?
              </div>
            </View.Condition>
            <View.Condition if={isInReviewAction}>
              <div>
                Ви впевнені, що хочете взяти версію <span className="text-primary">{version?.version}</span> на
                перевірку?
              </div>
            </View.Condition>
            <View.Condition if={isChangesRequestedAction}>
              <div>
                Ви впевнені, що версія <span className="text-primary">{version?.version}</span> ще потребує змін?
              </div>
            </View.Condition>
            <View.Condition if={isPendingGameApprovalAction}>
              <div>
                Ви впевнені, що хочете перевести версію <span className="text-primary">{version?.version}</span> в
                статус <span className="text-primary">{MissionModel.statusLabels[MissionStatus.PENDING_GAME_APPROVAL]}</span>?
              </div>
            </View.Condition>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => state.visibility.close()}>
              Скасувати
            </Button>
            <Button
              variant={
                isApproveAction || isInReviewAction || isPendingApprovalAction || isPendingGameApprovalAction
                  ? 'default'
                  : 'destructive'
              }
              onClick={() => {
                if (missionId && version?.id && status) {
                  state.changeStatus(missionId, version.id, status, onSuccess);
                }
              }}>
              {MissionModel.statusLabels[status]}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export { ChangeMissionVersionStatusModal };
