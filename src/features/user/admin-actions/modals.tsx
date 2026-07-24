'use client';

import { session } from '@/entities/session/model';
import { BanUnbanUserModal } from '@/features/user/ban-unban-user/ui';
import { AdminChangeNicknameModal } from '@/features/user/admin-change-nickname/ui';
import { ChangeUserRoleModal } from '@/features/user/change-user-role/ui';
import { IssueUserWarningModal } from '@/features/user/issue-user-warning/ui';
import { PunishmentHistoryModal } from '@/features/user/punishment-history/ui';
import { User, UserRole, UserWarning } from '@/shared/sdk/types';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';
import { UserAdminActionsModel } from './model';

export type UserAdminActionsModalCallbacks = {
  onBanSuccess?: (user: User) => void;
  onUnbanSuccess?: (user: User) => void;
  onChangeNicknameSuccess?: (user: User) => void;
  onIssueWarningSuccess?: (warning: UserWarning) => void;
  onWarningRemoved?: (warning: UserWarning) => void;
  onChangeRoleSuccess?: (userId: string, roles: UserRole[]) => void;
};

const UserAdminActionsModals: FC<
  {
    model: UserAdminActionsModel;
  } & UserAdminActionsModalCallbacks
> = observer(
  ({
    model,
    onBanSuccess,
    onUnbanSuccess,
    onChangeNicknameSuccess,
    onIssueWarningSuccess,
    onWarningRemoved,
    onChangeRoleSuccess,
  }) => {
    return (
      <>
        <BanUnbanUserModal
          model={model.banUnbanUserModel}
          onBanSuccess={onBanSuccess}
          onUnbanSuccess={onUnbanSuccess}
        />

        <AdminChangeNicknameModal model={model.adminChangeNicknameModel} onSuccess={onChangeNicknameSuccess} />

        <IssueUserWarningModal model={model.issueUserWarningModel} onSuccess={onIssueWarningSuccess} />

        <PunishmentHistoryModal model={model.punishmentHistoryModel} onWarningRemoved={onWarningRemoved} />

        {session.canManageRoles && (
          <ChangeUserRoleModal model={model.changeUserRoleModel} onSuccess={onChangeRoleSuccess} />
        )}
      </>
    );
  },
);

export { UserAdminActionsModals };
