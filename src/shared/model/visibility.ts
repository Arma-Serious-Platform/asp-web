import { makeAutoObservable } from 'mobx';
import { Loader } from './loader.ts';

class Visibility<T = void> {
  isOpen = false;

  payload: T | null = null;

  loader = new Loader();

  constructor() {
    makeAutoObservable(this);
  }

  clearPayload = () => {
    this.payload = null;
  };

  open = (payload?: T) => {
    if (typeof payload !== 'undefined') {
      this.payload = payload;
    }

    this.isOpen = true;
  };

  close = () => {
    this.isOpen = false;

    this.payload = null;
  };

  switch = (value?: boolean) => {
    this.isOpen = typeof value !== 'undefined' ? value : !this.isOpen;
  };
}

export { Visibility };
