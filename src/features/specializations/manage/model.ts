import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import { CreateSpecializationDto, Specialization, UpdateSpecializationDto } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class ManageSpecializationModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  modal = new Visibility<{
    specialization?: Specialization;
    mode: 'manage' | 'delete';
  }>();

  createSpecialization = async (
    dto: CreateSpecializationDto,
    onSuccess?: (specialization: Specialization) => void,
  ) => {
    try {
      this.loader.start();
      const { data } = await api.createSpecialization(dto);

      toast.success('Спеціалізацію створено');
      this.modal.close();
      onSuccess?.(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Не вдалося створити спеціалізацію');
    } finally {
      this.loader.stop();
    }
  };

  updateSpecialization = async (
    dto: UpdateSpecializationDto,
    onSuccess?: (specialization: Specialization) => void,
  ) => {
    try {
      this.loader.start();
      const { data } = await api.updateSpecialization(dto);

      toast.success('Спеціалізацію оновлено');
      this.modal.close();
      onSuccess?.(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Не вдалося оновити спеціалізацію');
    } finally {
      this.loader.stop();
    }
  };

  deleteSpecialization = async (id: string, onSuccess?: (specialization: Specialization) => void) => {
    try {
      this.loader.start();
      const { data } = await api.deleteSpecialization(id);

      toast.success('Спеціалізацію видалено');
      this.modal.close();
      onSuccess?.(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Не вдалося видалити спеціалізацію');
    } finally {
      this.loader.stop();
    }
  };
}
