'use client';

import { ApiModel } from '../api-model';
import type {
  ConnectedApp,
  CreateSsoClientDto,
  SsoAdminClient,
  SsoAdminClientWithSecret,
  SsoInteraction,
  SsoInteractionResult,
  UpdateSsoClientDto,
} from './sso.schemas';

export type * from './sso.schemas';
export * from './sso.schemas';

class SsoApi extends ApiModel {
  getInteraction = async (uid: string) => {
    return await this.instance.get<SsoInteraction>(`/sso/interactions/${encodeURIComponent(uid)}/details`);
  };

  confirmInteraction = async (uid: string) => {
    return await this.instance.post<SsoInteractionResult>(`/sso/interactions/${encodeURIComponent(uid)}/confirm`);
  };

  abortInteraction = async (uid: string) => {
    return await this.instance.post<SsoInteractionResult>(`/sso/interactions/${encodeURIComponent(uid)}/abort`);
  };

  findConnectedApps = async () => {
    return await this.instance.get<ConnectedApp[]>('/sso/connected-apps');
  };

  revokeConnectedApp = async (clientId: string) => {
    return await this.instance.delete<{ clientId: string }>(`/sso/connected-apps/${encodeURIComponent(clientId)}`);
  };

  findClients = async () => {
    return await this.instance.get<SsoAdminClient[]>('/sso/clients');
  };

  createClient = async (dto: CreateSsoClientDto) => {
    return await this.instance.post<SsoAdminClientWithSecret>('/sso/clients', dto);
  };

  updateClient = async (id: string, dto: UpdateSsoClientDto) => {
    return await this.instance.patch<SsoAdminClient>(`/sso/clients/${id}`, dto);
  };

  rotateClientSecret = async (id: string) => {
    return await this.instance.post<SsoAdminClientWithSecret>(`/sso/clients/${id}/rotate-secret`);
  };

  deleteClient = async (id: string) => {
    return await this.instance.delete<{ id: string }>(`/sso/clients/${id}`);
  };
}

export const ssoApi = new SsoApi();
export { SsoApi };
