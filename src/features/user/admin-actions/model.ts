import { BanUnbanUserModel } from '@/features/user/ban-unban-user/model';
import { AdminChangeNicknameModel } from '@/features/user/admin-change-nickname/model';
import { ChangeUserRoleModel } from '@/features/user/change-user-role/model';
import { IssueUserWarningModel } from '@/features/user/issue-user-warning/model';
import { PunishmentHistoryModel } from '@/features/user/punishment-history/model';
import { makeAutoObservable } from 'mobx';

export class UserAdminActionsModel {
  constructor() {
    makeAutoObservable(this);
  }

  banUnbanUserModel = new BanUnbanUserModel();
  adminChangeNicknameModel = new AdminChangeNicknameModel();
  issueUserWarningModel = new IssueUserWarningModel();
  punishmentHistoryModel = new PunishmentHistoryModel();
  changeUserRoleModel = new ChangeUserRoleModel();
}
