import { makeAutoObservable } from 'mobx';

import { apiKeysApi } from '@/shared/sdk';
import { ApiKey } from '@/shared/sdk/api-keys/api-keys.schemas';
import { Loader } from '@/shared/state/loader';
import { ManageApiKeysState } from './manage-api-keys.state';

export class ApiKeysPageState {
  loader = new Loader();
  apiKeys: ApiKey[] = [];
  manage = new ManageApiKeysState();

  constructor() {
    makeAutoObservable(this);
  }

  load = async () => {
    try {
      this.loader.start();
      const { data } = await apiKeysApi.findAll();
      this.apiKeys = data;
    } catch {
      this.apiKeys = [];
    } finally {
      this.loader.stop();
    }
  };
}

export const apiKeysPageState = new ApiKeysPageState();
