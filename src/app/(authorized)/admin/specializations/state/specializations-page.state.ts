import { specializationsApi } from '@/shared/sdk';
import { Specialization } from '@/shared/sdk/types';
import { Loader } from '@/shared/state/loader';
import { makeAutoObservable } from 'mobx';
import { ManageSpecializationState } from './manage-specializations.state';

class SpecializationsPageState {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  specializations: Specialization[] = [];

  manageSpecialization = new ManageSpecializationState();

  load = async () => {
    try {
      this.loader.start();
      const { data } = await specializationsApi.findSpecializations();

      this.specializations = data;
    } catch (error) {
      console.error(error);
    } finally {
      this.loader.stop();
    }
  };
}

export const specializationsPageState = new SpecializationsPageState();
