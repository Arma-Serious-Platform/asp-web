import { z } from 'zod';
import {
  fileRefSchema,
  fileSchema,
  messageAttachmentItemSchema,
  MissionGameSideSchema,
  missionCommentMessageSchema,
  PaginatedRequest,
  SideTypeSchema,
  SquadRoleSchema,
  UserRoleSchema,
} from '../api-model';
import { GameSchema } from '../weekends/weekends.schemas';

export const HeadquartersSquadShortSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    tag: z.string(),
    logo: fileRefSchema.nullable().optional(),
  })
  .passthrough();
export type HeadquartersSquadShort = z.infer<typeof HeadquartersSquadShortSchema>;

export const HeadquartersSlotSchema = z
  .object({
    id: z.string(),
    slotNumber: z.string(),
    name: z.string().nullable(),
    weaponry: z.string().nullable(),
    position: z.number().optional(),
    slotCount: z.number().nullable(),
    missionGameSide: MissionGameSideSchema.nullable().optional(),
    comment: z.string().nullable(),
    spawnPoint: z.string().nullable(),
    assignedSquads: z.array(HeadquartersSquadShortSchema),
    wantedSquads: z.array(HeadquartersSquadShortSchema),
  })
  .passthrough();
export type HeadquartersSlot = z.infer<typeof HeadquartersSlotSchema>;

export const HeadquartersSideShortSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    type: SideTypeSchema,
  })
  .passthrough();
export type HeadquartersSideShort = z.infer<typeof HeadquartersSideShortSchema>;

export const HeadquartersCommanderSchema = z
  .object({
    id: z.string(),
    nickname: z.string(),
    roles: z.array(UserRoleSchema),
    squadRole: SquadRoleSchema.nullable().optional(),
    avatar: fileRefSchema.nullable().optional(),
    squad: z
      .object({
        id: z.string(),
        tag: z.string(),
        side: z
          .object({
            type: SideTypeSchema,
          })
          .optional(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();
export type HeadquartersCommander = z.infer<typeof HeadquartersCommanderSchema>;

export const HeadquartersGamePlanSchema = z
  .object({
    id: z.string(),
    gameId: z.string(),
    planUrl: z.string().nullable(),
    gameCommanderId: z.string().nullable(),
    hqSquadId: z.string().nullable().optional(),
    hqSquad: HeadquartersSquadShortSchema.nullable().optional(),
    gameCommander: HeadquartersCommanderSchema.nullable().optional(),
    /** The detail endpoint returns the full game payload, so the mission panels can render from it. */
    game: GameSchema.optional(),
    side: HeadquartersSideShortSchema.optional(),
    slots: z.array(HeadquartersSlotSchema),
  })
  .passthrough();
export type HeadquartersGamePlan = z.infer<typeof HeadquartersGamePlanSchema>;

export const HeadquartersGamePlanListGameSchema = z
  .object({
    id: z.string(),
    date: z.string(),
    position: z.number(),
    mission: z
      .object({
        id: z.string(),
        name: z.string(),
        image: fileRefSchema.nullable().optional(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();
export type HeadquartersGamePlanListGame = z.infer<typeof HeadquartersGamePlanListGameSchema>;

/** Lightweight plan shape used by the plans list; the selected plan is loaded in full by id. */
export const HeadquartersGamePlanListItemSchema = z
  .object({
    id: z.string(),
    gameId: z.string(),
    gameCommanderId: z.string().nullable(),
    hqSquadId: z.string().nullable().optional(),
    hqSquad: HeadquartersSquadShortSchema.nullable().optional(),
    gameCommander: HeadquartersCommanderSchema.nullable().optional(),
    game: HeadquartersGamePlanListGameSchema.optional(),
    side: HeadquartersSideShortSchema.optional(),
  })
  .passthrough();
export type HeadquartersGamePlanListItem = z.infer<typeof HeadquartersGamePlanListItemSchema>;

export type FindHeadquartersPlansDto = PaginatedRequest;

export const UpdateHeadquartersGamePlanDtoSchema = z.object({
  planUrl: z.string().nullable().optional(),
});
export type UpdateHeadquartersGamePlanDto = z.infer<typeof UpdateHeadquartersGamePlanDtoSchema>;

export const UpdateHeadquartersGamePlanSlotDtoSchema = z.object({
  name: z.string().nullable().optional(),
  weaponry: z.string().nullable().optional(),
  slotCount: z.number().nullable().optional(),
  comment: z.string().nullable().optional(),
  spawnPoint: z.string().nullable().optional(),
});
export type UpdateHeadquartersGamePlanSlotDto = z.infer<typeof UpdateHeadquartersGamePlanSlotDtoSchema>;

export const AssignHeadquartersSlotSquadDtoSchema = z.object({
  squadId: z.string(),
});
export type AssignHeadquartersSlotSquadDto = z.infer<typeof AssignHeadquartersSlotSquadDtoSchema>;

export const HeadquartersCommentSchema = z
  .object({
    id: z.string(),
    gamePlanId: z.string(),
    userId: z.string(),
    replyId: z.string().nullable().optional(),
    message: missionCommentMessageSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
    user: z.any().optional(),
    attachments: z.array(messageAttachmentItemSchema).optional(),
    replyTo: z
      .object({
        id: z.string(),
        userId: z.string(),
        message: missionCommentMessageSchema,
        createdAt: z.string(),
        user: z
          .object({
            id: z.string(),
            nickname: z.string(),
          })
          .optional(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();
export type HeadquartersComment = z.infer<typeof HeadquartersCommentSchema>;

export type FindHeadquartersCommentsDto = PaginatedRequest<{
  replyId?: string;
}>;

export const FindHeadquartersCommentsDtoSchema = z
  .object({
    take: z.number().optional(),
    skip: z.number().optional(),
    replyId: z.string().optional(),
  })
  .passthrough();

export const CreateHeadquartersCommentDtoSchema = z.object({
  message: missionCommentMessageSchema,
  replyId: z.string().optional(),
  attachments: z.array(fileSchema).optional(),
});
export type CreateHeadquartersCommentDto = z.infer<typeof CreateHeadquartersCommentDtoSchema>;

export const UpdateHeadquartersCommentDtoSchema = z.object({
  message: missionCommentMessageSchema.optional(),
  replyId: z.string().nullable().optional(),
  attachments: z.array(fileSchema).optional(),
  removedAttachmentIds: z.array(z.string()).optional(),
});
export type UpdateHeadquartersCommentDto = z.infer<typeof UpdateHeadquartersCommentDtoSchema>;
