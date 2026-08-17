import { authApi } from '@/shared/sdk';
import { UserSession } from '@/shared/sdk/types';
import { Preloader } from '@/shared/state/loader';
import { makeAutoObservable } from 'mobx';

export class ManageSessionsState {
  sessions: UserSession[] = [];

  loader = new Preloader();

  revokingSessionId: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  load = async () => {
    this.loader.start();

    try {
      const { data } = await authApi.findActiveSessions();
      this.sessions = Array.isArray(data) ? data : [];
    } finally {
      this.loader.stop();
    }
  };

  revoke = async (sessionId: string) => {
    this.revokingSessionId = sessionId;

    try {
      await authApi.revokeSession(sessionId);
      this.sessions = this.sessions.filter(session => session.id !== sessionId);
    } finally {
      this.revokingSessionId = null;
    }
  };
}

export const manageSessionsState = new ManageSessionsState();
