import { BanUnbanUserState } from './ban-unban-user.state';
import { AdminChangeNicknameState } from './admin-change-nickname.state';
import { ChangeUserRoleState } from './change-user-role.state';
import { IssueUserWarningState } from './issue-user-warning.state';
import { PunishmentHistoryState } from './punishment-history.state';
import { makeAutoObservable } from 'mobx';

export class UserAdminActionsState {
  constructor() {
    makeAutoObservable(this);
  }

  banUnbanUserState = new BanUnbanUserState();
  adminChangeNicknameState = new AdminChangeNicknameState();
  issueUserWarningState = new IssueUserWarningState();
  punishmentHistoryState = new PunishmentHistoryState();
  changeUserRoleState = new ChangeUserRoleState();
}
