import { User, UserRole, UserStatus } from "@/shared/sdk/types";
import { makeAutoObservable } from "mobx";

class UserModel {
  constructor() {
    makeAutoObservable(this);
  }

  user: User | null = null;

  get isAdmin() {
    return this.user?.role === UserRole.OWNER || this.user?.role === UserRole.TECH_ADMIN;
  }

  get isBanned() {
    return this.user?.status === UserStatus.BANNED;
  }

  fetchUser() {

  }
}

export { UserModel };