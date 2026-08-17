import { z } from 'zod';
import { dateLikeSchema, PaginatedRequest, SideTypeSchema, type SideType } from '../api-model';

export const SideSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    type: SideTypeSchema,
    leaderId: z.string().nullable(),
    createdAt: dateLikeSchema,
    updatedAt: dateLikeSchema,
    serverId: z.string().nullable(),
    leader: z.any().nullable().optional(),
    server: z.any().nullable().optional(),
    squads: z.array(z.any()).default([]),
  })
  .passthrough();

export type Side = z.infer<typeof SideSchema>;

export type FindSidesDto = PaginatedRequest<{
  type?: SideType;
  search?: string;
}>;

export const FindSidesDtoSchema = z
  .object({
    take: z.number().optional(),
    skip: z.number().optional(),
    type: SideTypeSchema.optional(),
    search: z.string().optional(),
  })
  .passthrough();

export const CreateSideDtoSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  serverId: z.string().optional(),
});
export type CreateSideDto = z.infer<typeof CreateSideDtoSchema>;

export const UpdateSideDtoSchema = z.record(z.string(), z.unknown());
export type UpdateSideDto = z.infer<typeof UpdateSideDtoSchema>;
