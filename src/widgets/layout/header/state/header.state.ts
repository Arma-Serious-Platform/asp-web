import { Visibility } from '@/shared/state/visibility';
import { makeAutoObservable } from 'mobx';

class HeaderState {
  constructor() {
    makeAutoObservable(this);
  }

  mobileMenu = new Visibility();
}

export const headerState = new HeaderState();
