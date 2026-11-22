import { z } from 'zod';
import { fileRefSchema, SideTypeSchema, SquadRoleSchema, UserRoleSchema } from '../api-model';

const tribunalUserSchema = z
  .object({
    id: z.string(),
    nickname: z.string(),
    avatar: fileRefSchema.nullable().optional(),
    roles: z.array(UserRoleSchema).optional(),
    squadRole: SquadRoleSchema.optional(),
    squad: z
      .object({
        tag: z.string().nullable().optional(),
        side: z
          .object({
            type: SideTypeSchema.optional(),
          })
          .nullable()
          .optional(),
      })
      .nullable()
      .optional(),
  });

export const TribunalComplaintStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'PUNISHED', 'REJECTED']);
export const TribunalPunishmentKindSchema = z.enum(['NONE', 'WARNING', 'TEMP_BAN', 'PERMANENT_BAN']);

export const TribunalGameOptionSchema = z.object({
  id: z.string(),
  date: z.string(),
  missionName: z.string(),
});
export type TribunalGameOption = z.infer<typeof TribunalGameOptionSchema>;

export const TribunalComplaintSchema = z
  .object({
    id: z.string(),
    number: z.number(),
    authorId: z.string(),
    targetUserId: z.string(),
    assigneeId: z.string().nullable().optional(),
    ruleNumber: z.string().nullable().optional(),
    ruleText: z.string().nullable().optional(),
    attachments: z
      .array(
        z.object({
          id: z.string(),
          originalName: z.string(),
          mimeType: z.string().nullable().optional(),
          file: z
            .object({
              id: z.string(),
              url: z.string(),
              filename: z.string().optional(),
            })
            .nullable()
            .optional(),
        }),
      )
      .optional(),
    violatedAt: z.string(),
    gameId: z.string().nullable().optional(),
    description: z.string(),
    status: TribunalComplaintStatusSchema,
    punishmentKind: TribunalPunishmentKindSchema,
    warningWeight: z.number().nullable().optional(),
    bannedUntil: z.string().nullable().optional(),
    resolvedById: z.string().nullable().optional(),
    createdAt: z.string(),
    author: tribunalUserSchema,
    target: tribunalUserSchema,
    assignee: tribunalUserSchema.nullable().optional(),
    resolvedBy: tribunalUserSchema.nullable().optional(),
    game: z
      .object({
        id: z.string(),
        date: z.string(),
        mission: z.object({
          id: z.string(),
          name: z.string(),
        }),
      })
      .nullable()
      .optional(),
    _count: z
      .object({
        messages: z.number(),
      })
      .optional(),
  })
  .passthrough();
export type TribunalComplaint = z.infer<typeof TribunalComplaintSchema>;

export type TribunalFilters = {
  authors: { id: string; nickname: string }[];
  targets: { id: string; nickname: string }[];
  assignees: { id: string; nickname: string }[];
};

export type FindTribunalComplaintsParams = {
  status?: TribunalComplaint['status'];
  authorId?: string;
  targetUserId?: string;
  assigneeId?: string;
  take?: number;
  skip?: number;
};

export type TribunalComplaintList = {
  items: TribunalComplaint[];
  total: number;
};

export const TribunalMessageSchema = z.object({
  id: z.string(),
  complaintId: z.string(),
  authorId: z.string(),
  body: z.string(),
  createdAt: z.string(),
  author: tribunalUserSchema,
});
export type TribunalMessage = z.infer<typeof TribunalMessageSchema>;

export const TribunalComplaintDetailsSchema = TribunalComplaintSchema.extend({
  messages: z.array(TribunalMessageSchema),
});
export type TribunalComplaintDetails = z.infer<typeof TribunalComplaintDetailsSchema>;

export type CreateTribunalComplaintDto = {
  targetUserId: string;
  ruleNumber?: string;
  ruleText?: string;
  violatedAt: string;
  gameId?: string;
  description: string;
};

export type TribunalPunishmentRequest = {
  type: 'WARNING' | 'TEMP_BAN' | 'PERMANENT_BAN';
  reason?: string;
  bannedUntil?: string;
  mute?: boolean;
  warningCount?: number;
  comment?: string;
};

export type ResolveTribunalComplaintDto = {
  outcome: 'PUNISHED' | 'REJECTED';
  punishment?: TribunalPunishmentRequest;
  ruleNumber?: string;
  ruleText?: string;
  comment?: string;
};
