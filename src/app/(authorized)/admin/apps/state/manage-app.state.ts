import { makeAutoObservable, runInAction } from 'mobx';
import toast from 'react-hot-toast';

import { ssoApi } from '@/shared/sdk';
import type {
  CreateSsoClientDto,
  SsoAdminClient,
  SsoAdminClientWithSecret,
  UpdateSsoClientDto,
} from '@/shared/sdk/sso/sso.api';
import { Loader } from '@/shared/state/loader';
import { Visibility } from '@/shared/state/visibility';

/** The API answers 400 with one message per rejected URL. */
const getErrorMessage = (error: any, fallback: string) => {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message.join('\n');
  return typeof message === 'string' ? message : fallback;
};

export class ManageAppState {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  /** Shown once, right after creation or a new secret. */
  issued: SsoAdminClientWithSecret | null = null;

  modal = new Visibility<{
    app?: SsoAdminClient;
    mode: 'manage' | 'issued' | 'rotate' | 'toggle' | 'delete';
  }>();

  create = async (dto: CreateSsoClientDto, onSuccess?: () => void) => {
    try {
      this.loader.start();
      const { data } = await ssoApi.createClient(dto);
      runInAction(() => {
        this.issued = data;
      });
      this.modal.open({ app: data, mode: 'issued' });
      toast.success('Додаток створено');
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не вдалося створити додаток'));
    } finally {
      this.loader.stop();
    }
  };

  update = async (id: string, dto: UpdateSsoClientDto, onSuccess?: () => void) => {
    try {
      this.loader.start();
      await ssoApi.updateClient(id, dto);
      toast.success('Додаток оновлено');
      this.modal.close();
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не вдалося оновити додаток'));
    } finally {
      this.loader.stop();
    }
  };

  rotateSecret = async (id: string, onSuccess?: () => void) => {
    try {
      this.loader.start();
      const { data } = await ssoApi.rotateClientSecret(id);
      runInAction(() => {
        this.issued = data;
      });
      this.modal.open({ app: data, mode: 'issued' });
      toast.success('Новий секрет згенеровано');
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не вдалося згенерувати секрет'));
    } finally {
      this.loader.stop();
    }
  };

  toggleDisabled = async (app: SsoAdminClient, onSuccess?: () => void) => {
    try {
      this.loader.start();
      await ssoApi.updateClient(app.id, { disabled: !app.disabled });
      toast.success(app.disabled ? 'Додаток увімкнено' : 'Додаток вимкнено');
      this.modal.close();
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не вдалося змінити статус'));
    } finally {
      this.loader.stop();
    }
  };

  delete = async (id: string, onSuccess?: () => void) => {
    try {
      this.loader.start();
      await ssoApi.deleteClient(id);
      toast.success('Додаток видалено');
      this.modal.close();
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не вдалося видалити додаток'));
    } finally {
      this.loader.stop();
    }
  };

  clearIssued = () => {
    this.issued = null;
  };
}
