import { z } from 'zod';
import { SideTypeSchema, SquadRoleSchema, UserRoleSchema, dateLikeSchema, fileRefSchema } from '../api-model';

export const NotificationGroupSchema = z.enum([
  'CHAT',
  'HEADQUARTERS',
  'SQUAD',
  'MISSIONS',
  'ANNOUNCEMENTS',
  'PUNISHMENTS',
]);
export const NotificationGroup = NotificationGroupSchema.enum;
export type NotificationGroup = z.infer<typeof NotificationGroupSchema>;

export const NotificationTypeSchema = z.enum([
  'NEW_CHAT_MESSAGE',
  'NEW_MISSION_COMMENT',
  'NEW_PLAN_COMMENT',
  'SQUAD_INVITE',
  'SQUAD_JOIN_REQUEST',
  'WARNING',
  'WARNING_REMOVED',
  'TEMP_BAN',
  'PERMANENT_BAN',
  'UNBAN',
  'WEEKEND_PUBLISHED',
]);
export const NotificationType = NotificationTypeSchema.enum;
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationActorSchema = z
  .object({
    id: z.string(),
    nickname: z.string(),
    roles: z.array(UserRoleSchema).default([]),
    squadRole: SquadRoleSchema.optional(),
    avatar: fileRefSchema.nullable().optional(),
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
  .passthrough();
export type NotificationActor = z.infer<typeof NotificationActorSchema>;

export const NotificationPayloadSchema = z
  .object({
    messageId: z.string().optional(),
    peerUserId: z.string().optional(),
    preview: z.string().optional(),
    commentId: z.string().optional(),
    invitationId: z.string().optional(),
    joinRequestId: z.string().optional(),
    requesterId: z.string().optional(),
    reason: z.string().nullable().optional(),
    bannedUntil: z.string().nullable().optional(),
    warningId: z.string().optional(),
    name: z.string().optional(),
    automatic: z.boolean().optional(),
    isMuted: z.boolean().optional(),
  })
  .passthrough();
export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;

export const NotificationSchema = z
  .object({
    id: z.string(),
    recipientId: z.string(),
    actorId: z.string().nullable().optional(),
    type: NotificationTypeSchema,
    group: NotificationGroupSchema,
    targetId: z.string().nullable().optional(),
    payload: NotificationPayloadSchema.default({}),
    readAt: dateLikeSchema.nullable().optional(),
    createdAt: dateLikeSchema,
    actor: NotificationActorSchema.nullable().optional(),
  })
  .passthrough();
export type Notification = z.infer<typeof NotificationSchema>;

export const NotificationUnreadCountSchema = z.object({
  total: z.number(),
  byGroup: z.record(NotificationGroupSchema, z.number()),
});
export type NotificationUnreadCount = z.infer<typeof NotificationUnreadCountSchema>;

export const NotificationPreferenceItemSchema = z.object({
  group: NotificationGroupSchema,
  enabled: z.boolean(),
});
export type NotificationPreferenceItem = z.infer<typeof NotificationPreferenceItemSchema>;

export const NotificationPreferencesSchema = z.object({
  preferences: z.array(NotificationPreferenceItemSchema),
});
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;
