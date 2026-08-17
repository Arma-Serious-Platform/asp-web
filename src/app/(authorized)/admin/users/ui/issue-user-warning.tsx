import { Button } from '@/shared/ui/atoms/button';
import { Textarea } from '@/shared/ui/atoms/textarea';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/ui/organisms/drawer';
import { UserWarning } from '@/shared/sdk/types';
import { observer } from 'mobx-react-lite';
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { issueUserWarningState, IssueUserWarningState } from '../state/issue-user-warning.state';

const IssueUserWarningModal: FC<
  PropsWithChildren<{
    model?: IssueUserWarningState;
    onSuccess?: (warning: UserWarning) => void;
  }>
> = observer(({ model = issueUserWarningState, children, onSuccess }) => {
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
    <Drawer open={model.visibility.isOpen} onOpenChange={model.visibility.switch}>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
      <DrawerContent>
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <DrawerHeader>
            <DrawerTitle>
              Видати попередження <span className="text-primary">{user?.nickname}</span>
            </DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <Textarea
              label="Причина"
              value={reason}
              autoFocus
              disabled={model.loader.isLoading}
              onChange={event => setReason(event.target.value)}
            />
          </DrawerBody>

          <DrawerFooter className="border-t border-white/10 pt-4 sm:flex-row sm:justify-between">
            <Button variant="outline" disabled={model.loader.isLoading} onClick={() => model.visibility.close()}>
              Скасувати
            </Button>
            <Button disabled={model.loader.isLoading} onClick={submit}>
              Видати
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
});

export { IssueUserWarningModal };
