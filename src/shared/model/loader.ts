import { makeAutoObservable, reaction } from 'mobx';

class Preloader {
  private loaders = 0;

  isLoading = false;

  constructor(autostart = false) {
    makeAutoObservable(this);

    if (autostart) {
      this.start();
    }

    reaction(
      () => this.loaders,
      () => {
        this.isLoading = this.loaders > 0;
      }
    );
  }

  start = () => {
    this.loaders += 1;
  };

  stop = () => {
    if (this.loaders === 0) return;

    this.loaders -= 1;
  };
}

export { Preloader };
