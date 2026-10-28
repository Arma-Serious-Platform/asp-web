'use client';

export type SsoScope = 'profile' | 'email' | 'roles' | 'squad' | 'game' | 'offline_access';

export type SsoAccountState = 'active' | 'temporarily_banned' | 'deleted';

export type SsoClient = {
  clientId: string;
  name: string;
  firstParty: boolean;
  domain: string | null;
};

export type SsoInteraction = {
  uid: string;
  /** What the user has to do before returning to the app. */
  step: 'login' | 'consent' | 'continue';
  client: SsoClient;
  scopes: SsoScope[];
  user: {
    id: string;
    nickname: string;
    email: string;
    avatarUrl: string | null;
    accountState: SsoAccountState;
    bannedUntil: string | null;
  } | null;
};

export type SsoInteractionResult = {
  redirectTo: string;
};

/** An app as administrators see it. The secret is never returned again. */
export type SsoAdminClient = {
  id: string;
  clientId: string;
  name: string;
  redirectUris: string[];
  postLogoutRedirectUris: string[];
  backchannelLogoutUri: string | null;
  allowedScopes: SsoScope[];
  firstParty: boolean;
  disabled: boolean;
  confidential: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; nickname: string } | null;
};

/** Returned once, on creation or when a new secret is generated. */
export type SsoAdminClientWithSecret = SsoAdminClient & {
  clientSecret: string | null;
  discoveryUrl: string | null;
};

export type CreateSsoClientDto = {
  name: string;
  redirectUris: string[];
  postLogoutRedirectUris: string[];
  backchannelLogoutUri?: string;
  allowedScopes: SsoScope[];
  firstParty: boolean;
  confidential: boolean;
};

export type UpdateSsoClientDto = Partial<Omit<CreateSsoClientDto, 'confidential' | 'backchannelLogoutUri'>> & {
  backchannelLogoutUri?: string | null;
  disabled?: boolean;
};

export type ConnectedApp = SsoClient & {
  scopes: SsoScope[];
  lastUsedAt: string;
  grantedAt: string;
};
