import { authApi } from '@/shared/sdk';
import { DisableTwoFactorDto, TwoFactorSetupResponse } from '@/shared/sdk/types';
import { Preloader } from '@/shared/state/loader';
import { makeAutoObservable } from 'mobx';

export class ManageTwoFactorState {
  enabled = false;

  setupData: TwoFactorSetupResponse | null = null;

  recoveryCodes: string[] = [];

  loader = new Preloader();

  actionLoader = new Preloader();

  constructor() {
    makeAutoObservable(this);
  }

  load = async () => {
    this.loader.start();

    try {
      const { data } = await authApi.getTwoFactorStatus();
      this.enabled = Boolean(data.enabled);
    } finally {
      this.loader.stop();
    }
  };

  startSetup = async () => {
    this.actionLoader.start();

    try {
      const { data } = await authApi.setupTwoFactor();
      this.setupData = data;
    } finally {
      this.actionLoader.stop();
    }
  };

  cancelSetup = () => {
    this.setupData = null;
  };

  enable = async (code: string) => {
    this.actionLoader.start();

    try {
      const { data } = await authApi.enableTwoFactor({ code });
      this.recoveryCodes = data.recoveryCodes;
      this.enabled = true;
      this.setupData = null;
      return data.recoveryCodes;
    } finally {
      this.actionLoader.stop();
    }
  };

  disable = async (dto: DisableTwoFactorDto) => {
    this.actionLoader.start();

    try {
      await authApi.disableTwoFactor(dto);
      this.enabled = false;
      this.setupData = null;
      this.recoveryCodes = [];
    } finally {
      this.actionLoader.stop();
    }
  };

  clearRecoveryCodes = () => {
    this.recoveryCodes = [];
  };
}

export const manageTwoFactorState = new ManageTwoFactorState();
