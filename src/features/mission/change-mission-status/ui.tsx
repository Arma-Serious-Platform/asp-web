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
import { ChangeMissionVersionStatusModel } from './model';
import { MissionStatus } from '@/shared/sdk/types';
import { statusLabels } from '@/entities/mission/lib';
import { View } from '@/features/view';

const ChangeMissionVersionStatusModal: FC<
  PropsWithChildren<{
    model?: ChangeMissionVersionStatusModel;
    onSuccess?: (status: MissionStatus) => void;
  }>
> = observer(({ model, children, onSuccess }) => {
  if (!model) return null;

  const status = model.visibility?.payload?.status;
  const version = model.visibility?.payload?.version;
  const missionId = model.visibility?.payload?.missionId;

  const isApproveAction = status === MissionStatus.APPROVED;
  const statusLabel = status ? statusLabels[status] : '';

  return (
    <Dialog open={model.visibility.isOpen} onOpenChange={model.visibility.switch}>
      <DialogOverlay />
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <View.Condition if={isApproveAction}>
              <div>
                Ви впевнені, що хочете допустити версію місії <span className="text-primary">{version?.version}</span>{' '}
                до ігр?
              </div>
            </View.Condition>
            <View.Condition if={!isApproveAction}>
              <div>
                Ви впевнені, що версія <span className="text-primary">{version?.version}</span> ще потребує змін?
              </div>
            </View.Condition>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => model.visibility.close()}>
              Скасувати
            </Button>
            <Button
              variant={isApproveAction ? 'default' : 'destructive'}
              onClick={() => {
                if (missionId && version?.id && status) {
                  model.changeStatus(missionId, version.id, status, onSuccess);
                }
              }}>
              {isApproveAction ? 'Перевірено' : 'Потребує змін'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export { ChangeMissionVersionStatusModal };
