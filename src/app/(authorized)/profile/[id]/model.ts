import { UserProfileModel } from '@/widgets/users/profile/model';
import { makeAutoObservable } from 'mobx';

class UserProfilePageModel {
  constructor() {
    makeAutoObservable(this);
  }

  userProfile = new UserProfileModel(false);
}

export const model = new UserProfilePageModel();
