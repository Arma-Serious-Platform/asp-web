import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
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
import { CreateUserWarningResponse } from '@/shared/sdk/types';
import { observer } from 'mobx-react-lite';
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { issueUserWarningState, IssueUserWarningState } from '../state/issue-user-warning.state';

const IssueUserWarningModal: FC<
  PropsWithChildren<{
    model?: IssueUserWarningState;
    onSuccess?: (response: CreateUserWarningResponse) => void;
  }>
> = observer(({ model = issueUserWarningState, children, onSuccess }) => {
  const [ruleText, setRuleText] = useState('');
  const [comment, setComment] = useState('');
  const [ruleNumber, setRuleNumber] = useState('');
  const [weight, setWeight] = useState('1');
  const user = model.visibility.payload?.user;

  useEffect(() => {
    if (model.visibility.isOpen) {
      setRuleText('');
      setComment('');
      setRuleNumber('');
      setWeight('1');
    }
  }, [model.visibility.isOpen]);

  const submit = () => {
    const trimmedText = ruleText.trim();
    const trimmedComment = comment.trim();
    const count = Number(weight);

    if (trimmedText.length < 3 && trimmedComment.length < 3) {
      toast.error('Вкажіть текст правила або коментар');
      return;
    }

    if (!Number.isInteger(count) || count < 1 || count > 10) {
      toast.error('Кількість попереджень має бути від 1 до 10');
      return;
    }

    model.issueWarning(trimmedComment || trimmedText, onSuccess, {
      weight: count,
      ...(ruleNumber.trim() ? { ruleNumber: ruleNumber.trim() } : {}),
      ...(trimmedText ? { ruleText: trimmedText } : {}),
      ...(trimmedComment ? { comment: trimmedComment } : {}),
    });
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

          <DrawerBody className="flex flex-col gap-3">
            <Input
              label="№ правила"
              value={ruleNumber}
              disabled={model.loader.isLoading}
              onChange={event => setRuleNumber(event.target.value)}
            />
            <Input
              label="Кількість попереджень"
              type="number"
              min={1}
              max={10}
              value={weight}
              disabled={model.loader.isLoading}
              onChange={event => setWeight(event.target.value)}
            />
            <Textarea
              label="Текст правила"
              value={ruleText}
              disabled={model.loader.isLoading}
              onChange={event => setRuleText(event.target.value)}
            />
            <Textarea
              label="Коментар"
              value={comment}
              disabled={model.loader.isLoading}
              onChange={event => setComment(event.target.value)}
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
