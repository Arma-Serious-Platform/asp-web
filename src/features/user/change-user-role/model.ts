import { Loader } from '@/shared/model/loader';
import { Visibility } from '@/shared/model/visibility';
import { api } from '@/shared/sdk';
import { User, UserRole } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class ChangeUserRoleModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  visibility = new Visibility<{ user: User }>();

  async changeRole(userId: string, role: UserRole, onSuccess?: (userId: string, role: UserRole) => void) {
    try {
      this.loader.start();
      await api.changeUserRole({ id: userId, role });

      if (onSuccess) {
        onSuccess(userId, role);
      }

      toast.success(`Роль оновлено`);
      this.visibility.close();
    } catch {
      toast.error('Не вдалося змінити роль');
    } finally {
      this.loader.stop();
    }
  }
}

export const changeUserRoleModel = new ChangeUserRoleModel();
