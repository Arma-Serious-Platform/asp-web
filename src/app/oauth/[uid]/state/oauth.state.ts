import { isAxiosError } from 'axios';
import { makeAutoObservable, runInAction } from 'mobx';

import { ssoApi } from '@/shared/sdk';
import type { SsoInteraction } from '@/shared/sdk/sso/sso.api';
import { LoginState } from '@/app/auth/login/state/login.state';

export type OauthView = 'loading' | 'login' | 'consent' | 'redirecting' | 'blocked' | 'error';

/**
 * Sign-in requested by a connected app. The API decides the step; this page
 * signs in with the regular VTG login, asks for consent, then hands the
 * browser back to the provider.
 */
export class OauthState {
  uid: string | null = null;

  interaction: SsoInteraction | null = null;

  view: OauthView = 'loading';

  /** Shown on the error page, e.g. "login_request_expired". */
  errorCode = 'login_request_expired';

  isSubmitting = false;

  /** The login form is shown to sign in as someone else than `interaction.user`. */
  isSwitchingAccount = false;

  readonly login = new LoginState();

  constructor() {
    makeAutoObservable(this);
  }

  init = async (uid: string) => {
    this.uid = uid;
    this.interaction = null;
    this.view = 'loading';
    this.isSwitchingAccount = false;
    this.login.reset();

    await this.refresh();
  };

  /** Reloads the step, e.g. after the user signed in. */
  refresh = async () => {
    if (!this.uid) return;

    try {
      const { data } = await ssoApi.getInteraction(this.uid);
      const { step } = data;

      runInAction(() => {
        this.interaction = data;
        this.isSwitchingAccount = false;
      });

      if (step === 'continue') {
        await this.confirm();
        return;
      }

      runInAction(() => {
        this.view = step;
      });
    } catch (error) {
      this.fail(error);
    }
  };

  confirm = async () => {
    if (!this.uid) return;

    this.isSubmitting = true;

    try {
      const { data } = await ssoApi.confirmInteraction(this.uid);
      runInAction(() => {
        this.view = 'redirecting';
      });
      window.location.assign(data.redirectTo);
    } catch (error) {
      this.fail(error);
    } finally {
      runInAction(() => {
        this.isSubmitting = false;
      });
    }
  };

  /** "Скасувати": the app receives access_denied. */
  abort = async () => {
    if (!this.uid) return;

    this.isSubmitting = true;

    try {
      const { data } = await ssoApi.abortInteraction(this.uid);
      runInAction(() => {
        this.view = 'redirecting';
      });
      window.location.assign(data.redirectTo);
    } catch (error) {
      this.fail(error);
    } finally {
      runInAction(() => {
        this.isSubmitting = false;
      });
    }
  };

  /**
   * "Змінити акаунт": shows the login form. The current account stays signed
   * in until the other one has logged in; the API then ends its session.
   */
  switchAccount = () => {
    this.login.reset();
    this.isSwitchingAccount = true;
    this.view = 'login';
  };

  /** "Назад до …": back to the consent of the account still signed in. */
  cancelSwitch = () => {
    this.login.reset();
    this.isSwitchingAccount = false;
    this.view = 'consent';
  };

  showBlocked = () => {
    this.view = 'blocked';
  };

  private fail = (error: unknown) => {
    this.view = 'error';
    this.errorCode =
      isAxiosError(error) && error.response?.status === 404 ? 'login_request_expired' : 'login_request_failed';
  };
}

export const oauthState = new OauthState();
