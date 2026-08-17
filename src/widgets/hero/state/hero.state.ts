import { makeAutoObservable } from 'mobx';
import { IncomingWeekendsState } from './incoming-weekends.state';

class HeroState {
  constructor() {
    makeAutoObservable(this);
  }

  incomingWeekends = new IncomingWeekendsState();

  init = async () => {
    await this.incomingWeekends.init();
  };

  reset = () => {
    this.incomingWeekends.reset();
  };
}

const heroState = new HeroState();

export { heroState, HeroState };
