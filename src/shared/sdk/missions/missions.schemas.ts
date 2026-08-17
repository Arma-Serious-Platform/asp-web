import { z } from 'zod';
import {
  fileRefSchema,
  fileSchema,
  MissionGameSideSchema,
  MissionObjectiveSchema,
  MissionStatusSchema,
  MissionTypeSchema,
  missionCommentMessageSchema,
  PaginatedRequest,
  StateSchema,
  type MissionGameSide,
  type MissionObjective,
  type MissionStatus,
  type MissionType,
  type MissionCommentMessage,
  type State,
} from '../api-model';
import { IslandSchema } from '../islands/islands.schemas';
import { UserSchema } from '../users/users.schemas';

export const MissionWeaponrySchema = z
  .object({
    id: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
    count: z.number(),
    type: MissionGameSideSchema,
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough();
export type MissionWeaponry = z.infer<typeof MissionWeaponrySchema>;

export const MissionVersionScreenshotSchema = fileRefSchema;
export type MissionVersionScreenshot = z.infer<typeof MissionVersionScreenshotSchema>;

export const MissionVersionSchema = z
  .object({
    id: z.string(),
    version: z.string(),
    missionId: z.string(),
    attackSideType: MissionGameSideSchema,
    defenseSideType: MissionGameSideSchema,
    friendlySideType: MissionGameSideSchema.nullable().optional(),
    friendlyTo: MissionGameSideSchema.nullable().optional(),
    attackSideSlots: z.number(),
    defenseSideSlots: z.number(),
    friendlySideSlots: z.number().nullable().optional(),
    minSlotsToPlay: z.number().nullable().optional(),
    attackSideName: z.string(),
    defenseSideName: z.string(),
    friendlySideName: z.string().nullable().optional(),
    changesDescription: z.string().nullable().optional(),
    fileId: z.string().optional(),
    file: fileRefSchema.optional(),
    rating: z.number().optional(),
    weaponry: z.array(MissionWeaponrySchema).optional(),
    attackScreenshots: z.array(fileRefSchema).optional(),
    defenseScreenshots: z.array(fileRefSchema).optional(),
    friendlyScreenshots: z.array(fileRefSchema).optional(),
    uniformScreenshots: z
      .array(
        z
          .object({
            id: z.string(),
            side: MissionGameSideSchema,
            file: fileRefSchema.optional(),
          })
          .passthrough(),
      )
      .optional(),
    inGameTime: z.string().nullable().optional(),
    weather: z.string().nullable().optional(),
    changelog: missionCommentMessageSchema.nullable().optional(),
    reviewerId: z.string().nullable().optional(),
    reviewer: UserSchema.nullable().optional().or(z.any()),
    status: MissionStatusSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .passthrough();
export type MissionVersion = z.infer<typeof MissionVersionSchema>;

export const MissionSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: missionCommentMessageSchema,
    missionType: MissionTypeSchema,
    missionObjective: MissionObjectiveSchema,
    state: StateSchema,
    imageId: z.string().nullable().optional().default(null),
    image: fileRefSchema.optional(),
    island: IslandSchema.or(z.any()),
    author: UserSchema.optional().or(z.any()),
    coauthors: z.array(z.any()).default([]),
    missionVersions: z.array(MissionVersionSchema).default([]),
    authorId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .passthrough();
export type Mission = z.infer<typeof MissionSchema>;

export const MissionCommentSchema = z
  .object({
    id: z.string(),
    message: missionCommentMessageSchema,
    missionId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    userId: z.string().optional(),
    user: z.any().optional(),
    attachments: z.array(z.any()).optional(),
  })
  .passthrough();
export type MissionComment = z.infer<typeof MissionCommentSchema>;

export type FindMissionsDto = PaginatedRequest<{
  search?: string;
  status?: MissionStatus;
  state?: State;
  authorId?: string;
  reviewerId?: string;
  islandId?: string;
  minSlots?: number;
  maxSlots?: number;
  minSlotsToPlay?: number;
  missionType?: MissionType;
  missionObjective?: MissionObjective;
  orderBy?: 'createdAt';
  orderType?: 'asc' | 'desc';
}>;

export const FindMissionsDtoSchema = z
  .object({
    take: z.number().optional(),
    skip: z.number().optional(),
    search: z.string().optional(),
    status: MissionStatusSchema.optional(),
    state: StateSchema.optional(),
    authorId: z.string().optional(),
    reviewerId: z.string().optional(),
    islandId: z.string().optional(),
    minSlots: z.number().optional(),
    maxSlots: z.number().optional(),
    minSlotsToPlay: z.number().optional(),
    missionType: MissionTypeSchema.optional(),
    missionObjective: MissionObjectiveSchema.optional(),
    orderBy: z.literal('createdAt').optional(),
    orderType: z.enum(['asc', 'desc']).optional(),
  })
  .passthrough();

export const CreateMissionDtoSchema = z.object({
  islandId: z.string(),
  name: z.string(),
  description: missionCommentMessageSchema,
  missionType: MissionTypeSchema,
  missionObjective: MissionObjectiveSchema.optional(),
  coauthorIds: z.array(z.string()).optional(),
  image: fileSchema.optional(),
});
export type CreateMissionDto = z.infer<typeof CreateMissionDtoSchema>;

export const UpdateMissionDtoSchema = CreateMissionDtoSchema.partial().extend({
  id: z.string(),
});
export type UpdateMissionDto = z.infer<typeof UpdateMissionDtoSchema>;

export const ChangeMissionStateDtoSchema = z.object({
  state: StateSchema,
});
export type ChangeMissionStateDto = z.infer<typeof ChangeMissionStateDtoSchema>;

export const CreateMissionWeaponryDtoSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  count: z.number(),
  type: MissionGameSideSchema,
});
export type CreateMissionWeaponryDto = z.infer<typeof CreateMissionWeaponryDtoSchema>;

export const CreateMissionVersionDtoSchema = z.object({
  version: z.string(),
  missionId: z.string(),
  attackSideType: MissionGameSideSchema,
  defenseSideType: MissionGameSideSchema,
  attackSideSlots: z.number(),
  defenseSideSlots: z.number(),
  minSlotsToPlay: z.number().nullable().optional(),
  attackSideName: z.string(),
  defenseSideName: z.string(),
  friendlySideType: MissionGameSideSchema.optional(),
  friendlyTo: MissionGameSideSchema.optional(),
  friendlySideName: z.string().optional(),
  friendlySideSlots: z.number().optional(),
  file: fileSchema,
  attackScreenshots: z.array(fileSchema).optional(),
  defenseScreenshots: z.array(fileSchema).optional(),
  friendlyScreenshots: z.array(fileSchema).optional(),
  rating: z.number().optional(),
  weaponry: z.array(CreateMissionWeaponryDtoSchema).optional(),
  inGameTime: z.union([z.string(), z.date()]).nullable().optional(),
  weather: z.string().nullable().optional(),
  changelog: missionCommentMessageSchema.nullable().optional(),
});
export type CreateMissionVersionDto = z.infer<typeof CreateMissionVersionDtoSchema>;

export const UpdateMissionVersionDtoSchema = z.object({
  version: z.string().optional(),
  attackSideType: MissionGameSideSchema.optional(),
  defenseSideType: MissionGameSideSchema.optional(),
  attackSideSlots: z.number().optional(),
  defenseSideSlots: z.number().optional(),
  minSlotsToPlay: z.number().nullable().optional(),
  attackSideName: z.string().optional(),
  defenseSideName: z.string().optional(),
  friendlySideType: MissionGameSideSchema.nullable().optional(),
  friendlyTo: MissionGameSideSchema.nullable().optional(),
  friendlySideName: z.string().nullable().optional(),
  friendlySideSlots: z.number().nullable().optional(),
  clearFriendlySide: z.boolean().optional(),
  file: fileSchema.optional(),
  attackScreenshots: z.array(fileSchema).optional(),
  defenseScreenshots: z.array(fileSchema).optional(),
  friendlyScreenshots: z.array(fileSchema).optional(),
  removeAttackScreenshotIds: z.array(z.string()).optional(),
  removeDefenseScreenshotIds: z.array(z.string()).optional(),
  removeFriendlyScreenshotIds: z.array(z.string()).optional(),
  rating: z.number().optional(),
  weaponry: z.array(CreateMissionWeaponryDtoSchema).optional(),
  inGameTime: z.union([z.string(), z.date()]).nullable().optional(),
  weather: z.string().nullable().optional(),
  changelog: missionCommentMessageSchema.nullable().optional(),
});
export type UpdateMissionVersionDto = z.infer<typeof UpdateMissionVersionDtoSchema>;

export const CreateMissionCommentDtoSchema = z.object({
  message: missionCommentMessageSchema,
  missionId: z.string(),
  attachments: z.array(fileSchema).optional(),
});
export type CreateMissionCommentDto = z.infer<typeof CreateMissionCommentDtoSchema>;

export const UpdateMissionCommentDtoSchema = z.object({
  message: missionCommentMessageSchema.optional(),
  replyId: z.string().nullable().optional(),
  attachments: z.array(fileSchema).optional(),
  removedAttachmentIds: z.array(z.string()).optional(),
});
export type UpdateMissionCommentDto = z.infer<typeof UpdateMissionCommentDtoSchema>;

export type FindMissionCommentsDto = PaginatedRequest<{
  search?: string;
  missionId?: string;
}>;

export const FindMissionCommentsDtoSchema = z
  .object({
    take: z.number().optional(),
    skip: z.number().optional(),
    search: z.string().optional(),
    missionId: z.string().optional(),
  })
  .passthrough();

export type { MissionCommentMessage, MissionGameSide };
