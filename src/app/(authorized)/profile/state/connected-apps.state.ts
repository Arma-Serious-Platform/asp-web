import { ssoApi } from '@/shared/sdk';
import type { ConnectedApp } from '@/shared/sdk/sso/sso.api';
import { Preloader } from '@/shared/state/loader';
import { makeAutoObservable, runInAction } from 'mobx';

export class ConnectedAppsState {
  apps: ConnectedApp[] = [];

  loader = new Preloader();

  revokingClientId: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  load = async () => {
    this.loader.start();

    try {
      const { data } = await ssoApi.findConnectedApps();
      runInAction(() => {
        this.apps = Array.isArray(data) ? data : [];
      });
    } finally {
      this.loader.stop();
    }
  };

  revoke = async (clientId: string) => {
    this.revokingClientId = clientId;

    try {
      await ssoApi.revokeConnectedApp(clientId);
      runInAction(() => {
        this.apps = this.apps.filter(app => app.clientId !== clientId);
      });
    } finally {
      runInAction(() => {
        this.revokingClientId = null;
      });
    }
  };
}

export const connectedAppsState = new ConnectedAppsState();
