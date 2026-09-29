import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

import { apiKeysApi } from '@/shared/sdk';
import { ApiKey, CreateApiKeyResponse } from '@/shared/sdk/api-keys/api-keys.schemas';
import { Loader } from '@/shared/state/loader';
import { Visibility } from '@/shared/state/visibility';

export class ManageApiKeysState {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  createdKey: string | null = null;

  modal = new Visibility<{
    apiKey?: ApiKey;
    mode: 'manage' | 'delete' | 'created';
  }>();

  create = async (name: string, onSuccess?: (apiKey: CreateApiKeyResponse) => void) => {
    try {
      this.loader.start();
      const { data } = await apiKeysApi.create({ name });
      this.createdKey = data.key;
      this.modal.open({ apiKey: data, mode: 'created' });
      toast.success('API ключ створено');
      onSuccess?.(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Не вдалося створити API ключ');
    } finally {
      this.loader.stop();
    }
  };

  update = async (id: string, name: string, onSuccess?: (apiKey: ApiKey) => void) => {
    try {
      this.loader.start();
      const { data } = await apiKeysApi.update(id, { name });
      toast.success('API ключ оновлено');
      this.modal.close();
      onSuccess?.(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Не вдалося оновити API ключ');
    } finally {
      this.loader.stop();
    }
  };

  delete = async (id: string, onSuccess?: () => void) => {
    try {
      this.loader.start();
      await apiKeysApi.delete(id);
      toast.success('API ключ видалено');
      this.modal.close();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Не вдалося видалити API ключ');
    } finally {
      this.loader.stop();
    }
  };

  clearCreatedKey = () => {
    this.createdKey = null;
  };
}
