import { makeAutoObservable, runInAction } from 'mobx';

import { ssoApi } from '@/shared/sdk';
import type { SsoAdminClient } from '@/shared/sdk/sso/sso.api';
import { Loader } from '@/shared/state/loader';
import { ManageAppState } from './manage-app.state';

export class AppsPageState {
  loader = new Loader();
  apps: SsoAdminClient[] = [];
  manage = new ManageAppState();

  constructor() {
    makeAutoObservable(this);
  }

  load = async () => {
    try {
      this.loader.start();
      const { data } = await ssoApi.findClients();
      runInAction(() => {
        this.apps = data;
      });
    } catch {
      runInAction(() => {
        this.apps = [];
      });
    } finally {
      this.loader.stop();
    }
  };
}

export const appsPageState = new AppsPageState();
