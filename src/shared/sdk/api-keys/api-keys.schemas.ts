'use client';

import type { SideType, SquadRole, UserRole } from '@/shared/sdk/types';

export type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    nickname: string;
    roles?: UserRole[];
    squadRole?: SquadRole | null;
    squad?: {
      id: string;
      name: string;
      tag: string;
      side?: {
        id: string;
        name: string;
        type: SideType;
      } | null;
    } | null;
  } | null;
};

export type CreateApiKeyDto = {
  name: string;
};

export type UpdateApiKeyDto = {
  name: string;
};

export type CreateApiKeyResponse = ApiKey & {
  key: string;
};
