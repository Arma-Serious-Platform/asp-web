'use client';

import { User } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { cn } from '@/shared/utils/cn';
import { BanIcon, HandHeartIcon, PencilIcon, ScrollTextIcon, ShieldIcon, TriangleAlertIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';
import { getUserAdminActionsAvailability, hasAnyUserAdminAction } from './lib';
import { UserAdminActionsModel } from './model';

const UserAdminActionsButtons: FC<{
  user: User;
  model: UserAdminActionsModel;
  className?: string;
}> = observer(({ user, model, className }) => {
  const availability = getUserAdminActionsAvailability(user);

  if (!hasAnyUserAdminAction(availability)) {
    return null;
  }

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      {availability.changeRoles && (
        <Button
          size="sm"
          className="w-full"
          align="left"
          variant="secondary"
          onClick={() => {
            model.changeUserRoleModel.visibility.open({ user });
          }}>
          <ShieldIcon className="w-4 h-4" />
          Змінити ролі
        </Button>
      )}

      {availability.changeNickname && (
        <Button
          size="sm"
          className="w-full"
          align="left"
          variant="secondary"
          onClick={() => {
            model.adminChangeNicknameModel.visibility.open({ user });
          }}>
          <PencilIcon className="w-4 h-4" />
          Змінити позивний
        </Button>
      )}

      {availability.issueWarning && (
        <Button
          size="sm"
          className="w-full"
          align="left"
          variant="secondary"
          onClick={() => {
            model.issueUserWarningModel.visibility.open({ user });
          }}>
          <TriangleAlertIcon className="w-4 h-4 text-amber-300" />
          Видати попередження
        </Button>
      )}

      {availability.punishmentHistory && (
        <Button
          size="sm"
          className="w-full"
          align="left"
          variant="secondary"
          onClick={() => {
            model.punishmentHistoryModel.visibility.open({ user });
          }}>
          <ScrollTextIcon className="w-4 h-4 text-sky-300" />
          Історія покарань
        </Button>
      )}

      {availability.ban && (
        <Button
          size="sm"
          className="w-full"
          align="left"
          variant="secondary"
          onClick={() => {
            model.banUnbanUserModel.visibility.open({ user });
          }}>
          <BanIcon className="w-4 h-4 text-red-500" />
          Заблокувати
        </Button>
      )}

      {availability.unban && (
        <Button
          size="sm"
          className="w-full"
          align="left"
          variant="secondary"
          onClick={() => {
            model.banUnbanUserModel.visibility.open({ user });
          }}>
          <HandHeartIcon className="w-4 h-4 text-green-500" />
          Розблокувати
        </Button>
      )}
    </div>
  );
});

export { UserAdminActionsButtons };
