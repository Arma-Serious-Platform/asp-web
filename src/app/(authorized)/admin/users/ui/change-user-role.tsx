'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Checkbox } from '@/shared/ui/atoms/checkbox';
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
import { changeUserRoleState, ChangeUserRoleState } from '../state/change-user-role.state';
import { UserRole } from '@/shared/sdk/types';
import { UserModel } from '@/entities/user/user.model';
import { session } from '@/entities/session/session.state';
import { cn } from '@/shared/utils/cn';

const BASE_ASSIGNABLE_ROLES: UserRole[] = [
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

type RoleOption = {
  value: UserRole;
  label: string;
  editable: boolean;
};

const getRoleOptions = (actorRoles: UserRole[] | undefined, currentRoles: UserRole[]): RoleOption[] => {
  if (UserModel.hasAnyRole(actorRoles, [UserRole.OWNER])) {
    return [UserRole.OWNER, ...BASE_ASSIGNABLE_ROLES].map(role => ({
      value: role,
      label: UserModel.roleLabels[role],
      editable: true,
    }));
  }

  if (UserModel.hasAnyRole(actorRoles, [UserRole.SERVER_ADMIN])) {
    return BASE_ASSIGNABLE_ROLES.filter(
      role => role !== UserRole.SERVER_ADMIN && role !== UserRole.OWNER,
    ).map(role => ({
      value: role,
      label: UserModel.roleLabels[role],
      editable: true,
    }));
  }

  if (UserModel.hasAnyRole(actorRoles, [UserRole.UVK])) {
    const lockedRoles = currentRoles.filter(role => role !== UserRole.MISSION_REVIEWER);
    const options: RoleOption[] = lockedRoles.map(role => ({
      value: role,
      label: UserModel.roleLabels[role],
      editable: false,
    }));

    options.push({
      value: UserRole.MISSION_REVIEWER,
      label: UserModel.roleLabels[UserRole.MISSION_REVIEWER],
      editable: true,
    });

    return options;
  }

  return [];
};

const ChangeUserRoleModal: FC<
  PropsWithChildren<{
    model?: ChangeUserRoleState;
    onSuccess?: (userId: string, roles: UserRole[]) => void;
  }>
> = observer(({ model = changeUserRoleState, children, onSuccess }) => {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);

  const user = model.visibility?.payload?.user;
  const open = model.visibility.isOpen;
  const actorRoles = session.user?.data?.roles;

  const roleOptions = useMemo(
    () => getRoleOptions(actorRoles, user?.roles ?? []),
    [actorRoles, user?.roles],
  );

  useEffect(() => {
    if (open && user) {
      setSelectedRoles(user.roles?.length ? [...user.roles] : [UserRole.USER]);
    }
  }, [open, user]);

  const handleOpenChange = (next: boolean) => {
    if (!next) setSelectedRoles([]);
    model.visibility.switch(next);
  };

  const isUvkOnly = UserModel.hasAnyRole(actorRoles, [UserRole.UVK])
    && !UserModel.hasAnyRole(actorRoles, [UserRole.OWNER, UserRole.SERVER_ADMIN]);

  const toggleRole = (role: UserRole) => {
    setSelectedRoles(current => {
      if (current.includes(role)) {
        const next = current.filter(item => item !== role);
        return next.length ? next : [UserRole.USER];
      }

      // UVK only toggles MISSION_REVIEWER — keep every other role (including USER).
      if (isUvkOnly || role === UserRole.MISSION_REVIEWER) {
        return [...current, role];
      }

      return [...current.filter(item => item !== UserRole.USER || role === UserRole.USER), role];
    });
  };

  const handleConfirm = () => {
    if (!user || !selectedRoles.length) return;

    // UVK must submit original roles with only MISSION_REVIEWER added/removed.
    const rolesToSubmit = isUvkOnly
      ? [
          ...(user.roles ?? []).filter(role => role !== UserRole.MISSION_REVIEWER),
          ...(selectedRoles.includes(UserRole.MISSION_REVIEWER)
            ? [UserRole.MISSION_REVIEWER]
            : []),
        ]
      : selectedRoles;

    if (!rolesToSubmit.length) return;
    if (sameRoles(rolesToSubmit, user.roles ?? [])) return;
    model.changeRole(user.id, rolesToSubmit, (userId, roles) => {
      onSuccess?.(userId, roles);
    });
  };

  if (!user) return null;

  const unchanged = sameRoles(selectedRoles, user.roles ?? []);

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
      <DrawerContent>
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <DrawerHeader>
            <DrawerTitle>
              Змінити ролі гравця <span className="text-primary">{user.nickname}</span>
            </DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <div className="flex flex-col gap-2">
              {roleOptions.map(option => {
                const checked = selectedRoles.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={checked}
                    disabled={!option.editable}
                    className={cn(
                      'flex items-center gap-2 text-sm text-zinc-100',
                      !option.editable && 'cursor-not-allowed opacity-50',
                    )}
                    onClick={() => {
                      if (!option.editable) return;
                      toggleRole(option.value);
                    }}>
                    <Checkbox
                      checked={checked}
                      className={!option.editable ? 'cursor-not-allowed' : undefined}
                    />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </DrawerBody>

          <DrawerFooter className="border-t border-white/10 pt-4 sm:flex-row sm:justify-end sm:gap-2">
            <Button variant="outline" onClick={() => model.visibility.close()}>
              Скасувати
            </Button>
            <Button disabled={unchanged || model.loader.isLoading} onClick={handleConfirm}>
              Підтвердити
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
});

export { ChangeUserRoleModal };
