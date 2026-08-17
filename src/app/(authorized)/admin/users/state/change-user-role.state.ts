import { Loader } from '@/shared/state/loader';
import { Visibility } from '@/shared/state/visibility';
import { usersApi } from '@/shared/sdk';
import { User, UserRole } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

export class ChangeUserRoleState {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  visibility = new Visibility<{ user: User }>();

  async changeRole(userId: string, roles: UserRole[], onSuccess?: (userId: string, roles: UserRole[]) => void) {
    try {
      this.loader.start();
      await usersApi.changeUserRole({ id: userId, roles });

      if (onSuccess) {
        onSuccess(userId, roles);
      }

      toast.success(`Ролі оновлено`);
      this.visibility.close();
    } catch {
      toast.error('Не вдалося змінити ролі');
    } finally {
      this.loader.stop();
    }
  }
}

export const changeUserRoleState = new ChangeUserRoleState();
