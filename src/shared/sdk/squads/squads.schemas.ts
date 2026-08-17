import { z } from 'zod';
import {
  fileRefSchema,
  fileSchema,
  missionCommentMessageSchema,
  PaginatedRequest,
  SquadRoleSchema,
  SideTypeSchema,
  type SquadRole,
  type SideType,
} from '../api-model';

export const SquadInviteStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'LEAVED']);
export const SquadInviteStatus = SquadInviteStatusSchema.enum;
export type SquadInviteStatus = z.infer<typeof SquadInviteStatusSchema>;

export const SquadJoinRequestStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED']);
export type SquadJoinRequestStatus = z.infer<typeof SquadJoinRequestStatusSchema>;

export const SquadDescriptionSchema = missionCommentMessageSchema;
export type SquadDescription = z.infer<typeof SquadDescriptionSchema>;

const loose = z.any();

export const SquadSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    leaderId: z.string(),
    sideId: z.string(),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
    activeCount: z.number(),
    description: SquadDescriptionSchema.nullable(),
    logo: fileRefSchema.nullable(),
    tag: z.string(),
    recruiting: z.boolean(),
    telegramUrl: z.string().optional(),
    discordUrl: z.string().optional(),
    youtubeUrl: z.string().optional(),
    twitchUrl: z.string().optional(),
    tiktokUrl: z.string().optional(),
    leader: loose,
    side: loose,
    invites: z.array(loose).default([]),
    joinRequests: z.array(loose).optional(),
    members: z.array(loose).default([]),
    _count: z
      .object({
        members: z.number(),
        invites: z.number(),
        joinRequests: z.number().optional(),
      })
      .passthrough(),
  })
  .passthrough();

export type Squad = z.infer<typeof SquadSchema>;

export const SquadJoinRequestSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    squadId: z.string(),
    status: SquadJoinRequestStatusSchema,
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
    squad: loose,
    user: loose,
  })
  .passthrough();
export type SquadJoinRequest = z.infer<typeof SquadJoinRequestSchema>;

export const SquadInvitationSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    squadId: z.string(),
    status: SquadInviteStatusSchema,
    squadRole: SquadRoleSchema.optional(),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
    squad: loose,
    user: loose,
  })
  .passthrough();
export type SquadInvitation = z.infer<typeof SquadInvitationSchema>;

export type FindSquadsDto = PaginatedRequest<{
  search?: string;
  sideType?: SideType;
}>;

export const FindSquadsDtoSchema = z
  .object({
    take: z.number().optional(),
    skip: z.number().optional(),
    search: z.string().optional(),
    sideType: SideTypeSchema.optional(),
  })
  .passthrough();

export const InviteToSquadDtoSchema = z.object({
  userId: z.string(),
  squadRole: z.enum(['MEMBER', 'RECRUIT']).optional(),
});
export type InviteToSquadDto = z.infer<typeof InviteToSquadDtoSchema>;

export const UpdateSquadMemberRoleDtoSchema = z.object({
  userId: z.string(),
  role: SquadRoleSchema,
});
export type UpdateSquadMemberRoleDto = z.infer<typeof UpdateSquadMemberRoleDtoSchema>;

export const CreateSquadDtoSchema = z.object({
  name: z.string(),
  tag: z.string(),
  description: SquadDescriptionSchema.optional(),
  leaderId: z.string(),
  sideId: z.string(),
  activeCount: z.number().optional(),
  logo: fileSchema.optional(),
});
export type CreateSquadDto = z.infer<typeof CreateSquadDtoSchema>;

export const UpdateSquadDtoSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  tag: z.string().optional(),
  description: SquadDescriptionSchema.optional(),
  leaderId: z.string().optional(),
  sideId: z.string().optional(),
  recruiting: z.boolean().optional(),
  activeCount: z.number().optional(),
  logo: fileSchema.optional(),
  telegramUrl: z.string().optional(),
  discordUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  twitchUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
});
export type UpdateSquadDto = z.infer<typeof UpdateSquadDtoSchema>;

export const UpdateMySquadDtoSchema = z.object({
  name: z.string().optional(),
  tag: z.string().optional(),
  description: SquadDescriptionSchema.optional(),
  recruiting: z.boolean().optional(),
  activeCount: z.number().optional(),
  logo: fileSchema.optional(),
  telegramUrl: z.string().optional(),
  discordUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  twitchUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
});
export type UpdateMySquadDto = z.infer<typeof UpdateMySquadDtoSchema>;

export const LeaveSquadDtoSchema = z.object({
  newLeaderId: z.string().optional(),
});
export type LeaveSquadDto = z.infer<typeof LeaveSquadDtoSchema>;

// keep SquadRole type used by InviteToSquadDto consumers
export type { SquadRole };
