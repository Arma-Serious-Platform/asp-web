'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Checkbox } from '@/shared/ui/atoms/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/organisms/dialog';
import { observer } from 'mobx-react-lite';
import { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { changeUserRoleModel, ChangeUserRoleModel } from './model';
import { UserRole } from '@/shared/sdk/types';
import { USER_ROLE_LABELS } from '@/entities/user/lib';

const ASSIGNABLE_ROLES: UserRole[] = [
  UserRole.SERVER_ADMIN,
  UserRole.TECH_ADMIN,
  UserRole.MISSION_REVIEWER,
  UserRole.UVK,
  UserRole.GAME_ADMIN,
  UserRole.MINI_ADMIN,
  UserRole.USER,
];

const sortedRoles = (roles: UserRole[]) => [...roles].sort();

const sameRoles = (a: UserRole[], b: UserRole[]) => {
  const left = sortedRoles(a);
  const right = sortedRoles(b);
  return left.length === right.length && left.every((role, index) => role === right[index]);
};

const ChangeUserRoleModal: FC<
  PropsWithChildren<{
    model?: ChangeUserRoleModel;
    onSuccess?: (userId: string, roles: UserRole[]) => void;
  }>
> = observer(({ model = changeUserRoleModel, children, onSuccess }) => {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);

  const roleOptions = useMemo(
    () => ASSIGNABLE_ROLES.map(role => ({ value: role, label: USER_ROLE_LABELS[role] })),
    [],
  );

  const user = model.visibility?.payload?.user;
  const open = model.visibility.isOpen;

  useEffect(() => {
    if (open && user) {
      setSelectedRoles(user.roles?.length ? [...user.roles] : [UserRole.USER]);
    }
  }, [open, user]);

  const handleOpenChange = (next: boolean) => {
    if (!next) setSelectedRoles([]);
    model.visibility.switch(next);
  };

  const toggleRole = (role: UserRole) => {
    setSelectedRoles(current => {
      if (current.includes(role)) {
        const next = current.filter(item => item !== role);
        return next.length ? next : [UserRole.USER];
      }

      return [...current.filter(item => item !== UserRole.USER || role === UserRole.USER), role];
    });
  };

  const handleConfirm = () => {
    if (!user || !selectedRoles.length) return;
    if (sameRoles(selectedRoles, user.roles ?? [])) return;
    model.changeRole(user.id, selectedRoles, (userId, roles) => {
      onSuccess?.(userId, roles);
    });
  };

  if (!user) return null;

  const unchanged = sameRoles(selectedRoles, user.roles ?? []);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogOverlay />
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Змінити ролі гравця <span className="text-primary">{user.nickname}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {roleOptions.map(option => {
              const checked = selectedRoles.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={checked}
                  className="flex items-center gap-2 text-sm text-zinc-100"
                  onClick={() => toggleRole(option.value)}>
                  <Checkbox checked={checked} />
                  {option.label}
                </button>
              );
            })}
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => model.visibility.close()}>
              Скасувати
            </Button>
            <Button disabled={unchanged || model.loader.isLoading} onClick={handleConfirm}>
              Підтвердити
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export { ChangeUserRoleModal };
