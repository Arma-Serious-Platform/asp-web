'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Select } from '@/shared/ui/atoms/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/organisms/dialog';
import { observer } from 'mobx-react-lite';
import { FC, PropsWithChildren, useMemo, useState } from 'react';
import { changeUserRoleModel, ChangeUserRoleModel } from './model';
import { User, UserRole } from '@/shared/sdk/types';
import { USER_ROLE_LABELS } from '@/entities/user/lib';

const ROLES_ORDER: UserRole[] = [
  UserRole.OWNER,
  UserRole.TECH_ADMIN,
  UserRole.GAME_ADMIN,
  UserRole.MINI_ADMIN,
  UserRole.USER,
];

const ChangeUserRoleModal: FC<
  PropsWithChildren<{
    model?: ChangeUserRoleModel;
    onSuccess?: (userId: string, role: UserRole) => void;
  }>
> = observer(({ model = changeUserRoleModel, children, onSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const roleOptions = useMemo(() => ROLES_ORDER.map(role => ({ value: role, label: USER_ROLE_LABELS[role] })), []);

  const user = model.visibility?.payload?.user;
  const open = model.visibility.isOpen;

  const handleOpenChange = (next: boolean) => {
    if (!next) setSelectedRole(null);
    model.visibility.switch(next);
  };

  const handleConfirm = () => {
    if (!user) return;
    const roleToApply = selectedRole ?? user.role;
    if (roleToApply === user.role) return;
    model.changeRole(user.id, roleToApply, (userId, role) => {
      onSuccess?.(userId, role);
    });
    setSelectedRole(null);
  };

  if (!user) return null;

  const currentRole = selectedRole ?? user.role;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogOverlay />
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Змінити роль гравця <span className="text-primary">{user.nickname}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Select
            label="Нова роль"
            options={roleOptions}
            value={currentRole}
            onChange={v => setSelectedRole((v ?? user.role) as UserRole)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => model.visibility.close()}>
              Скасувати
            </Button>
            <Button disabled={currentRole === user.role} onClick={handleConfirm}>
              Підтвердити
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export { ChangeUserRoleModal };
