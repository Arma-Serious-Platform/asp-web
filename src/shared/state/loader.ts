import { makeAutoObservable } from 'mobx';

class Preloader {
  private loaders = 0;

  constructor(autostart = false) {
    makeAutoObservable(this);

    if (autostart) {
      this.start();
    }
  }

  get isLoading() {
    return this.loaders > 0;
  }

  start = () => {
    this.loaders += 1;
  };

  stop = () => {
    if (this.loaders === 0) return;

    this.loaders -= 1;
  };

  /** Alias used by Pagination */
  add = () => {
    this.start();
  };

  /** Alias used by Pagination */
  remove = () => {
    this.stop();
  };

  clear = () => {
    this.loaders = 0;
  };
}

export { Preloader, Preloader as Loader };
