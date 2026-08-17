import { z } from 'zod';
import { PaginatedRequest } from '../api-model';

export const GameSchema = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    date: z.string(),
    position: z.number(),
    missionId: z.string(),
    missionVersionId: z.string(),
    attackSideId: z.string(),
    defenseSideId: z.string(),
    adminId: z.string().nullable(),
    attackHqSquadId: z.string().nullable().optional(),
    defenseHqSquadId: z.string().nullable().optional(),
    weekendId: z.string().optional(),
    weekend: z.lazy(() => WeekendSchema).optional(),
    missionVersion: z.any(),
    mission: z.any(),
    admin: z.any().nullable().optional(),
  })
  .passthrough();
export type Game = z.infer<typeof GameSchema>;

export const WeekendSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    published: z.boolean(),
    publishedAt: z.string().nullable(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    games: z.array(z.lazy(() => GameSchema)).optional(),
  })
  .passthrough();
export type Weekend = z.infer<typeof WeekendSchema>;

export type FindWeekendsDto = PaginatedRequest<{
  search?: string;
  published?: boolean;
}>;

export const FindWeekendsDtoSchema = z
  .object({
    take: z.number().optional(),
    skip: z.number().optional(),
    search: z.string().optional(),
    published: z.boolean().optional(),
  })
  .passthrough();

export const CreateGameDtoSchema = z.object({
  date: z.string(),
  position: z.number(),
  missionId: z.string(),
  missionVersionId: z.string(),
  attackSideId: z.string(),
  defenseSideId: z.string(),
  adminId: z.string().nullable().optional(),
  attackHqSquadId: z.string().nullable().optional(),
  defenseHqSquadId: z.string().nullable().optional(),
});
export type CreateGameDto = z.infer<typeof CreateGameDtoSchema>;

export const CreateWeekendDtoSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  games: z.array(CreateGameDtoSchema),
  published: z.boolean().optional(),
  publishedAt: z.string().nullable().optional(),
});
export type CreateWeekendDto = z.infer<typeof CreateWeekendDtoSchema>;

export const UpdateWeekendDtoSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().nullable().optional(),
});
export type UpdateWeekendDto = z.infer<typeof UpdateWeekendDtoSchema>;

export const UpdateGameDtoSchema = z.object({
  date: z.string().optional(),
  position: z.number().optional(),
  missionId: z.string().optional(),
  missionVersionId: z.string().optional(),
  attackSideId: z.string().optional(),
  defenseSideId: z.string().optional(),
  adminId: z.string().nullable().optional(),
  attackHqSquadId: z.string().nullable().optional(),
  defenseHqSquadId: z.string().nullable().optional(),
});
export type UpdateGameDto = z.infer<typeof UpdateGameDtoSchema>;
