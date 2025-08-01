import { Loader } from '@/shared/model/loader';
import { api } from '@/shared/sdk';
import { Squad } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';

class SquadModel {
  constructor() {
    makeAutoObservable(this);
  }

  data: Squad[] = [];

  loader = new Loader();

  findSquads = async () => {
    try {
      this.loader.start();
      const { data } = await api.findSquads();

      this.data = data;
    } catch (error) {
      console.error(error);
    } finally {
      this.loader.stop();
    }
  };

  reset = () => {
    this.data = [];
  };
}

export { SquadModel };
