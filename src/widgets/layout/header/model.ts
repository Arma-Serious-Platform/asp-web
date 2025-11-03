import { Visibility } from '@/shared/model/visibility';
import { makeAutoObservable } from 'mobx';

class HeaderModel {
  constructor() {
    makeAutoObservable(this);
  }

  mobileMenu = new Visibility();
}

export const headerModel = new HeaderModel();
