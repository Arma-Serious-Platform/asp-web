'use client';

import { AchievementOptionContent } from '@/entities/achievement';
import { Achievement } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Select } from '@/shared/ui/atoms/select';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/ui/organisms/drawer';
import { observer } from 'mobx-react-lite';
import { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { ManageUserAchievementsState } from '../state/manage-user-achievements.state';

const areStringArraysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, index) => value === sortedB[index]);
};

const ManageUserAchievementsModal: FC<
  PropsWithChildren<{
    model: ManageUserAchievementsState;
    onSuccess?: (userId: string, achievements: Achievement[]) => void;
  }>
> = observer(({ model, children, onSuccess }) => {
  const [draftIds, setDraftIds] = useState<string[]>([]);
  const user = model.user;
  const open = model.visibility.isOpen;

  useEffect(() => {
    if (!open) {
      setDraftIds([]);
      return;
    }

    void model.loadCatalog();
    void model.loadAssigned();
  }, [open, model, user?.id]);

  useEffect(() => {
    if (open) {
      setDraftIds(model.assignedIds);
    }
  }, [open, model.assignedIds]);

  const options = useMemo(
    () =>
      model.catalog.map(achievement => ({
        label: achievement.title,
        value: achievement.id,
        content: <AchievementOptionContent achievement={achievement} />,
      })),
    [model.catalog],
  );

  const handleOpenChange = (next: boolean) => {
    if (!next) setDraftIds([]);
    model.visibility.switch(next);
  };

  const handleConfirm = () => {
    if (!user) return;
    if (areStringArraysEqual(draftIds, model.assignedIds)) return;
    void model.save(draftIds, onSuccess);
  };

  if (!user) return null;

  const unchanged = areStringArraysEqual(draftIds, model.assignedIds);
  const isBusy = model.loader.isLoading || model.catalogLoader.isLoading;

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
      <DrawerContent>
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <DrawerHeader>
            <DrawerTitle>
              Досягнення гравця <span className="text-primary">{user.nickname}</span>
            </DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <Select
              multiple
              closeOnSelect={false}
              value={draftIds}
              onChange={value => setDraftIds(value)}
              options={options}
              placeholder="Оберіть досягнення"
              localSearch
              isLoading={model.catalogLoader.isLoading}
              disabled={isBusy || options.length === 0}
            />
          </DrawerBody>

          <DrawerFooter className="border-t border-white/10 pt-4 sm:flex-row sm:justify-end sm:gap-2">
            <Button variant="outline" onClick={() => model.visibility.close()}>
              Скасувати
            </Button>
            <Button disabled={unchanged || isBusy} onClick={handleConfirm}>
              Зберегти
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
});

export { ManageUserAchievementsModal };
