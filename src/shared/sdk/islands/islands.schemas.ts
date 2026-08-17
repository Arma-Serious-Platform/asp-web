import { z } from 'zod';
import { PaginatedRequest } from '../api-model';

export const IslandSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .passthrough();

export type Island = z.infer<typeof IslandSchema>;

export type FindIslandsDto = PaginatedRequest<{
  search?: string;
}>;

export const FindIslandsDtoSchema = z
  .object({
    take: z.number().optional(),
    skip: z.number().optional(),
    search: z.string().optional(),
  })
  .passthrough();

export const CreateIslandDtoSchema = z.object({
  name: z.string(),
  code: z.string(),
});
export type CreateIslandDto = z.infer<typeof CreateIslandDtoSchema>;

export const UpdateIslandDtoSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
});
export type UpdateIslandDto = z.infer<typeof UpdateIslandDtoSchema>;
