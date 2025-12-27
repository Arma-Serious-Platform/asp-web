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
import {
  changeIsReviewerModel,
  ChangeIsReviewerModel,
} from './model';

const ChangeIsReviewerModal: FC<
  PropsWithChildren<{
    model?: ChangeIsReviewerModel;
    onSuccess?: (userId: string, isMissionReviewer: boolean) => void;
  }>
> = observer(({ model = changeIsReviewerModel, children, onSuccess }) => {
  const isReviewer = model.visibility?.payload?.user?.isMissionReviewer;
  const isRevokeAction = isReviewer === true;

  return (
    <Dialog
      open={model.visibility.isOpen}
      onOpenChange={model.visibility.switch}>
      <DialogOverlay />
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Ви впевнені, що хочете{' '}
            {isRevokeAction
              ? 'зняти з перевірки місій'
              : 'зробити перевіряючим місій'}{' '}
            гравця{' '}
            <span className='text-primary'>
              {model.visibility?.payload?.user?.nickname}
            </span>
            ?
          </DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-2'>
          <div className='flex justify-between mt-4'>
            <Button variant='outline' onClick={() => model.visibility.close()}>
              Скасувати
            </Button>
            <Button
              variant={isRevokeAction ? 'destructive' : 'default'}
              onClick={() => {
                model.changeIsReviewer(
                  model.visibility?.payload?.user?.id || '',
                  model.visibility?.payload?.isMissionReviewer || false,
                  (isMissionReviewer) => {
                    onSuccess?.(model.visibility?.payload?.user?.id || '', isMissionReviewer);
                  }
                );
              }}>
              {isRevokeAction
                ? 'Зняти з перевірки місій'
                : 'Зробити перевіряючим місій'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export { ChangeIsReviewerModal };

