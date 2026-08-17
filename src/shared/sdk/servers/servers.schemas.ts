import { z } from 'zod';
import { PaginatedRequest, ServerStatusSchema, type ServerStatus } from '../api-model';

export const ServerSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    status: ServerStatusSchema,
    createdAt: dateLikeOrString(),
    updatedAt: dateLikeOrString(),
    ip: z.string(),
    port: z.number(),
    sides: z.array(z.unknown()).optional().default([]),
    info: z
      .object({
        name: z.string(),
        game: z.string(),
        map: z.string(),
        maxPlayers: z.number(),
        players: z.number(),
        ping: z.number(),
      })
      .optional(),
  })
  .passthrough();

function dateLikeOrString() {
  return z.union([z.string(), z.date()]);
}

export type Server = z.infer<typeof ServerSchema>;

export type FindServersDto = PaginatedRequest<{
  search?: string;
  status?: ServerStatus;
  fetchActualInfo?: boolean;
}>;

export const FindServersDtoSchema = z
  .object({
    take: z.number().optional(),
    skip: z.number().optional(),
    search: z.string().optional(),
    status: ServerStatusSchema.optional(),
    fetchActualInfo: z.boolean().optional(),
  })
  .passthrough();

export const UpdateServerDtoSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  ip: z.string().optional(),
  port: z.number().optional(),
  status: ServerStatusSchema.optional(),
});
export type UpdateServerDto = z.infer<typeof UpdateServerDtoSchema>;

export const CreateServerDtoSchema = z.object({
  name: z.string(),
  ip: z.string(),
  port: z.number(),
  status: ServerStatusSchema,
});
export type CreateServerDto = z.infer<typeof CreateServerDtoSchema>;
