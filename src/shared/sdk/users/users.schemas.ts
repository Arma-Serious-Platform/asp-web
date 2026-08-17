import { z } from 'zod';
import {
  dateLikeSchema,
  fileRefSchema,
  PaginatedRequest,
  SideTypeSchema,
  SoldierAbilitySchema,
  SquadRoleSchema,
  UserRoleSchema,
  UserStatusSchema,
  type UserRole,
  type UserStatus,
} from '../api-model';

/** Nested relations left loose (`any`) to avoid circular schema graph failures. */
const loose = z.any();

export const UserSchema = z
  .object({
    id: z.string(),
    email: z.string(),
    nickname: z.string(),
    password: z.string().optional().default(''),
    createdAt: dateLikeSchema,
    updatedAt: dateLikeSchema,
    abilities: z.array(SoldierAbilitySchema).default([]),
    squadId: z.string().nullable().optional().default(null),
    activationToken: z.string().nullable().optional().default(null),
    activationTokenExpiresAt: dateLikeSchema.nullable().optional().default(null),
    status: UserStatusSchema,
    roles: z.array(UserRoleSchema).default([]),
    steamId: z.string().nullable().optional().default(null),
    lastIp: z.string().nullable().optional().default(null),
    resetPasswordToken: z.string().nullable().optional().default(null),
    resetPasswordTokenExpiresAt: dateLikeSchema.nullable().optional().default(null),
    avatar: fileRefSchema.nullable().optional().default(null),
    bannedUntil: dateLikeSchema.nullable().optional().default(null),
    banReason: z.string().nullable().optional(),
    isMuted: z.boolean().optional(),
    missions: z.array(loose).default([]),
    side: loose.nullable().optional(),
    leadingSquad: loose.nullable().optional(),
    squadInvites: z.array(loose).default([]),
    squad: loose.nullable().optional(),
    squadRole: SquadRoleSchema.nullable().optional(),
    specializations: z.array(loose).optional(),
    telegramUrl: z.string().optional(),
    discordUrl: z.string().optional(),
    twitchUrl: z.string().optional(),
    youtubeUrl: z.string().optional(),
    tiktokUrl: z.string().optional(),
    twoFactorEnabled: z.boolean().optional(),
    _count: z.record(z.string(), z.number()).optional(),
  })
  .passthrough();

export type User = z.infer<typeof UserSchema>;

export const ChangeNicknameDtoSchema = z.object({
  nickname: z.string(),
});
export type ChangeNicknameDto = z.infer<typeof ChangeNicknameDtoSchema>;

export const ChangeUserNicknameDtoSchema = ChangeNicknameDtoSchema.extend({
  userId: z.string(),
});
export type ChangeUserNicknameDto = z.infer<typeof ChangeUserNicknameDtoSchema>;

export const CreateUserWarningDtoSchema = z.object({
  userId: z.string(),
  reason: z.string(),
});
export type CreateUserWarningDto = z.infer<typeof CreateUserWarningDtoSchema>;

export const UserWarningSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    adminId: z.string().nullable(),
    removedById: z.string().nullable().optional(),
    reason: z.string(),
    removeReason: z.string().nullable().optional(),
    removedAt: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    admin: z
      .object({
        id: z.string(),
        nickname: z.string(),
      })
      .nullable()
      .optional(),
    removedBy: z
      .object({
        id: z.string(),
        nickname: z.string(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();
export type UserWarning = z.infer<typeof UserWarningSchema>;

export const UserPunishmentTypeSchema = z.enum([
  'WARNING',
  'WARNING_REMOVED',
  'TEMP_BAN',
  'PERMANENT_BAN',
  'UNBAN',
]);
export const UserPunishmentType = UserPunishmentTypeSchema.enum;
export type UserPunishmentType = z.infer<typeof UserPunishmentTypeSchema>;

export const UserPunishmentSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    adminId: z.string().nullable(),
    warningId: z.string().nullable(),
    type: UserPunishmentTypeSchema,
    reason: z.string().nullable(),
    bannedUntil: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    admin: z
      .object({
        id: z.string(),
        nickname: z.string(),
      })
      .nullable()
      .optional(),
    warning: z
      .object({
        id: z.string(),
        reason: z.string(),
        removedAt: z.string().nullable().optional(),
        removeReason: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();
export type UserPunishment = z.infer<typeof UserPunishmentSchema>;

export const UserHistoryEventTypeSchema = z.enum([
  'SIGN_UP',
  'SQUAD_JOIN',
  'SQUAD_LEAVE',
  'WARNING',
  'WARNING_REMOVED',
  'TEMP_BAN',
  'PERMANENT_BAN',
  'UNBAN',
  'NICKNAME_CHANGE',
  'ROLE_CHANGE',
  'REVIEWER_CHANGE',
]);
export const UserHistoryEventType = UserHistoryEventTypeSchema.enum;
export type UserHistoryEventType = z.infer<typeof UserHistoryEventTypeSchema>;

export const UserHistoryEventPayloadSchema = z
  .object({
    reason: z.string().nullable().optional(),
    bannedUntil: z.string().nullable().optional(),
    punishmentId: z.string().nullable().optional(),
    warningId: z.string().nullable().optional(),
    squadId: z.string().nullable().optional(),
    squadTag: z.string().nullable().optional(),
    oldNickname: z.string().nullable().optional(),
    newNickname: z.string().nullable().optional(),
    oldRoles: z.array(UserRoleSchema).nullable().optional(),
    newRoles: z.array(UserRoleSchema).nullable().optional(),
    oldRole: UserRoleSchema.nullable().optional(),
    newRole: UserRoleSchema.nullable().optional(),
    oldValue: z.boolean().nullable().optional(),
    newValue: z.boolean().nullable().optional(),
    isMuted: z.boolean().nullable().optional(),
  })
  .passthrough();
export type UserHistoryEventPayload = z.infer<typeof UserHistoryEventPayloadSchema>;

export const UserHistoryEventSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    actorId: z.string().nullable(),
    type: UserHistoryEventTypeSchema,
    payload: UserHistoryEventPayloadSchema,
    createdAt: z.string(),
    actor: z
      .object({
        id: z.string(),
        nickname: z.string(),
        roles: z.array(UserRoleSchema),
        squadRole: SquadRoleSchema.optional(),
        squad: z
          .object({
            tag: z.string().optional(),
            side: z
              .object({
                type: SideTypeSchema.optional(),
              })
              .optional(),
          })
          .nullable()
          .optional(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();
export type UserHistoryEvent = z.infer<typeof UserHistoryEventSchema>;

export const UpdateMeDtoSchema = z.object({
  nickname: z.string().optional(),
  email: z.string().optional(),
  steamId: z.string().optional(),
  telegramUrl: z.string().optional(),
  discordUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  twitchUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
});
export type UpdateMeDto = z.infer<typeof UpdateMeDtoSchema>;

/** @deprecated Use UpdateMeDto for PATCH /users/me */
export type UpdateUserDto = UpdateMeDto;
export const UpdateUserDtoSchema = UpdateMeDtoSchema;

export type FindUsersDto = PaginatedRequest<{
  search?: string;
  status?: UserStatus;
  role?: UserRole;
  hasSquad?: boolean;
  /** Filter users who have authored at least one mission */
  hasMission?: boolean;
  /** Filter users who can review mission versions */
  canReviewMissions?: boolean;
}>;

export const FindUsersDtoSchema = z
  .object({
    take: z.number().optional(),
    skip: z.number().optional(),
    search: z.string().optional(),
    status: UserStatusSchema.optional(),
    role: UserRoleSchema.optional(),
    hasSquad: z.boolean().optional(),
    hasMission: z.boolean().optional(),
    canReviewMissions: z.boolean().optional(),
  })
  .passthrough();

/** bannedUntil is sent as path param (ISO string). Required by API. */
export const BanUserDtoSchema = z.object({
  userId: z.string(),
  bannedUntil: z.union([z.string(), z.date()]),
  reason: z.string(),
  mute: z.boolean().optional(),
});
export type BanUserDto = z.infer<typeof BanUserDtoSchema>;

export const UnbanUserDtoSchema = z.object({
  userId: z.string(),
  reason: z.string().optional(),
});
export type UnbanUserDto = z.infer<typeof UnbanUserDtoSchema>;

/** Body for PUT /users/change-role */
export const ChangeUserRoleDtoSchema = z.object({
  id: z.string(),
  roles: z.array(UserRoleSchema),
});
export type ChangeUserRoleDto = z.infer<typeof ChangeUserRoleDtoSchema>;
