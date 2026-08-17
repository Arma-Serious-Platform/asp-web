'use client';

import axios, { type AxiosInstance } from 'axios';
import { z } from 'zod';

import { env } from '../config/env';
import { ROUTES } from '../config/routes';
import { AUTH_REDIRECT_SKIP_PATHS } from '../lib/routes/lib';

const AUTH_PAGES = [ROUTES.auth.login, ROUTES.auth.signup, ROUTES.auth.forgotPassword] as const;

/* Shared FormData helpers */

export const appendStringArrayToFormData = (formData: FormData, key: string, values?: string[]) => {
  if (!values) return;

  if (values.length === 0) {
    formData.append(key, '[]');
    return;
  }

  values.forEach((value, index) => {
    formData.append(`${key}[${index}]`, value);
  });
};

export const appendFormDataValue = (formData: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null) return;

  if (value instanceof File) {
    formData.append(key, value);
    return;
  }

  formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value.toString());
};

export const extractUploadFiles = (files?: File[]) =>
  files?.filter((file): file is File => file instanceof File) ?? [];

export const appendAttachmentUpdateFormData = (
  formData: FormData,
  fields: {
    message?: unknown;
    content?: unknown;
    removedAttachmentIds?: string[];
  },
  files: File[],
) => {
  if (fields.message !== undefined) {
    formData.append('message', JSON.stringify(fields.message));
  }
  if (fields.content !== undefined) {
    formData.append('content', JSON.stringify(fields.content));
  }
  if (fields.removedAttachmentIds?.length) {
    formData.append('removedAttachmentIds', JSON.stringify(fields.removedAttachmentIds));
  }
  files.forEach(file => {
    formData.append('attachments', file);
  });
};

export const fileSchema = z.custom<File>((val): val is File => typeof File !== 'undefined' && val instanceof File);

/* Common Zod enums / primitives */

/** Soft date: API JSON often sends ISO strings. */
export const dateLikeSchema = z.union([z.string(), z.date()]);

export const MissionGameSideSchema = z.enum(['BLUE', 'RED', 'GREEN']);
export const MissionGameSide = MissionGameSideSchema.enum;
export type MissionGameSide = z.infer<typeof MissionGameSideSchema>;

export const ServerStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);
export const ServerStatus = ServerStatusSchema.enum;
export type ServerStatus = z.infer<typeof ServerStatusSchema>;

export const MissionStatusSchema = z.enum([
  'APPROVED',
  'PENDING_APPROVAL',
  'CHANGES_REQUESTED',
  'IN_REVIEW',
  'PENDING_GAME_APPROVAL',
]);
export const MissionStatus = MissionStatusSchema.enum;
export type MissionStatus = z.infer<typeof MissionStatusSchema>;

export const MissionTypeSchema = z.enum(['SG', 'mini']);
export const MissionType = MissionTypeSchema.enum;
export type MissionType = z.infer<typeof MissionTypeSchema>;

export const MissionObjectiveSchema = z.enum(['ATTACK_DEFEND', 'ENCOUTER_BATTLE']);
export const MissionObjective = MissionObjectiveSchema.enum;
export type MissionObjective = z.infer<typeof MissionObjectiveSchema>;

export const StateSchema = z.enum(['ACTIVE', 'ARCHIVED']);
export const State = StateSchema.enum;
export type State = z.infer<typeof StateSchema>;

export const SideTypeSchema = z.enum(['BLUE', 'RED', 'UNASSIGNED']);
export const SideType = SideTypeSchema.enum;
export type SideType = z.infer<typeof SideTypeSchema>;

export const UserStatusSchema = z.enum(['ACTIVE', 'INVITED', 'BANNED']);
export const UserStatus = UserStatusSchema.enum;
export type UserStatus = z.infer<typeof UserStatusSchema>;

export const UserRoleSchema = z.enum([
  'OWNER',
  'SERVER_ADMIN',
  'TECH_ADMIN',
  'MISSION_REVIEWER',
  'UVK',
  'GAME_ADMIN',
  'MINI_ADMIN',
  'USER',
]);
export const UserRole = UserRoleSchema.enum;
export type UserRole = z.infer<typeof UserRoleSchema>;

export const SquadRoleSchema = z.enum(['MEMBER', 'HQ', 'SUBLEADER', 'RECRUIT']);
export const SquadRole = SquadRoleSchema.enum;
export type SquadRole = z.infer<typeof SquadRoleSchema>;

export const SoldierAbilitySchema = z.enum([
  'COMMANDER',
  'MEDIC',
  'SNIPER',
  'ANTI_TANK',
  'ANTI_AIR',
  'HELI_PILOT',
  'JET_PILOT',
  'TANK_CREW',
  'VEHICLE_CREW',
]);
export const SoldierAbility = SoldierAbilitySchema.enum;
export type SoldierAbility = z.infer<typeof SoldierAbilitySchema>;

export const fileRefSchema = z
  .object({
    id: z.string(),
    url: z.string(),
    name: z.string().optional(),
    filename: z.string().optional(),
  })
  .passthrough();

export const missionCommentMessageSchema = z.union([z.record(z.string(), z.unknown()), z.string()]);
export type MissionCommentMessage = z.infer<typeof missionCommentMessageSchema>;

export const messageAttachmentItemSchema = z
  .object({
    id: z.string(),
    originalName: z.string(),
    mimeType: z.string().nullable().optional(),
    file: fileRefSchema.optional(),
  })
  .passthrough();
export type MessageAttachmentItem = z.infer<typeof messageAttachmentItemSchema>;

export type PaginatedRequest<T = object> = {
  take?: number;
  skip?: number;
} & T;

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  take: number;
  skip: number;
};

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    data: z.array(item),
    total: z.number(),
    take: z.number(),
    skip: z.number(),
  });

/**
 * Base API client: shared axios instance + interceptors only.
 * Domain APIs extend this class and call `this.instance`.
 */
class ApiModel {
  private static axiosInstance: AxiosInstance | null = null;
  private static interceptorsInstalled = false;

  get instance(): AxiosInstance {
    if (!ApiModel.axiosInstance) {
      ApiModel.axiosInstance = axios.create({
        baseURL: env.apiUrl,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return ApiModel.axiosInstance;
  }

  constructor() {
    if (!ApiModel.interceptorsInstalled) {
      this.setupInterceptors();
      ApiModel.interceptorsInstalled = true;
    }
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(request => {
      if (request.data instanceof FormData && request.headers) {
        if (typeof request.headers.delete === 'function') {
          request.headers.delete('Content-Type');
        } else {
          delete (request.headers as Record<string, unknown>)['Content-Type'];
        }
      }

      return request;
    });

    this.instance.interceptors.response.use(
      response => response,
      error => {
        const status = error.response?.status;
        const requestUrl = error.config?.url ?? '';

        if (
          status === 401 &&
          typeof window !== 'undefined' &&
          !this.shouldSkipAuthRedirect(requestUrl, window.location.pathname)
        ) {
          window.location.assign(ROUTES.auth.login);
        }

        return Promise.reject(error);
      },
    );
  }

  private shouldSkipAuthRedirect(requestUrl: string, pathname: string) {
    if (AUTH_REDIRECT_SKIP_PATHS.some(path => requestUrl.includes(path))) {
      return true;
    }

    return AUTH_PAGES.some(path => pathname.startsWith(path));
  }
}

export { ApiModel };
