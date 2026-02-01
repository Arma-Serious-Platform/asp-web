import { makeAutoObservable } from 'mobx';
import { IncomingWeekendsModel } from '../incoming-weekends/model';

class HeroModel {
  constructor() {
    makeAutoObservable(this);
  }

  incomingWeekends = new IncomingWeekendsModel();

  init = async () => {
    await this.incomingWeekends.init();
  };

  reset = () => {
    this.incomingWeekends.reset();
  };
}

const model = new HeroModel();

export { model, HeroModel };
