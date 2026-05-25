import { ManageSpecializationModel } from '@/features/specializations/manage/model';
import { Loader } from '@/shared/model/loader';
import { api } from '@/shared/sdk';
import { Specialization } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';

class AdminSpecializationsModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  specializations: Specialization[] = [];

  manageSpecialization = new ManageSpecializationModel();

  load = async () => {
    try {
      this.loader.start();
      const { data } = await api.findSpecializations();

      this.specializations = data;
    } catch (error) {
      console.error(error);
    } finally {
      this.loader.stop();
    }
  };
}

export const adminSpecializationsModel = new AdminSpecializationsModel();
