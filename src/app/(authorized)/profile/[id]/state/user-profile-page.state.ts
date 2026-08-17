import { UserProfileState } from '../../state/user-profile.state';
import { makeAutoObservable } from 'mobx';

class UserProfilePageState {
  constructor() {
    makeAutoObservable(this);
  }

  userProfile = new UserProfileState(false);
}

export const userProfilePageState = new UserProfilePageState();
