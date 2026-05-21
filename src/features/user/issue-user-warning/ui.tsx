import { Button } from '@/shared/ui/atoms/button';
import { Textarea } from '@/shared/ui/atoms/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/organisms/dialog';
import { UserWarning } from '@/shared/sdk/types';
import { observer } from 'mobx-react-lite';
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { issueUserWarningModel, IssueUserWarningModel } from './model';

const IssueUserWarningModal: FC<
  PropsWithChildren<{
    model?: IssueUserWarningModel;
    onSuccess?: (warning: UserWarning) => void;
  }>
> = observer(({ model = issueUserWarningModel, children, onSuccess }) => {
  const [reason, setReason] = useState('');
  const user = model.visibility.payload?.user;

  useEffect(() => {
    if (model.visibility.isOpen) {
      setReason('');
    }
  }, [model.visibility.isOpen]);

  const submit = () => {
    const trimmedReason = reason.trim();

    if (trimmedReason.length < 3) {
      toast.error('Вкажіть причину попередження');
      return;
    }

    model.issueWarning(trimmedReason, onSuccess);
  };

  return (
    <Dialog open={model.visibility.isOpen} onOpenChange={model.visibility.switch}>
      <DialogOverlay />
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Видати попередження <span className="text-primary">{user?.nickname}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Textarea
            label="Причина"
            value={reason}
            autoFocus
            disabled={model.loader.isLoading}
            onChange={event => setReason(event.target.value)}
          />

          <div className="flex justify-between mt-2">
            <Button variant="outline" disabled={model.loader.isLoading} onClick={() => model.visibility.close()}>
              Скасувати
            </Button>
            <Button disabled={model.loader.isLoading} onClick={submit}>
              Видати
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export { IssueUserWarningModal };
