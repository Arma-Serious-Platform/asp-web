'use client';

import { session } from '@/entities/session/session.state';
import { BanUnbanUserModal } from './ban-unban-user';
import { AdminChangeNicknameModal } from './admin-change-nickname';
import { ChangeUserRoleModal } from './change-user-role';
import { IssueUserWarningModal } from './issue-user-warning';
import { PunishmentHistoryModal } from './punishment-history';
import { User, UserRole, UserWarning } from '@/shared/sdk/types';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';
import { UserAdminActionsState } from '../state/admin-actions.state';

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
    model: UserAdminActionsState;
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
          model={model.banUnbanUserState}
          onBanSuccess={onBanSuccess}
          onUnbanSuccess={onUnbanSuccess}
        />

        <AdminChangeNicknameModal model={model.adminChangeNicknameState} onSuccess={onChangeNicknameSuccess} />

        <IssueUserWarningModal model={model.issueUserWarningState} onSuccess={onIssueWarningSuccess} />

        <PunishmentHistoryModal model={model.punishmentHistoryState} onWarningRemoved={onWarningRemoved} />

        {session.canManageRoles && (
          <ChangeUserRoleModal model={model.changeUserRoleState} onSuccess={onChangeRoleSuccess} />
        )}
      </>
    );
  },
);

export { UserAdminActionsModals };
