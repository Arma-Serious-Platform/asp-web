import { z } from 'zod';
import { dateLikeSchema, fileRefSchema, fileSchema } from '../api-model';

export const SpecializationSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    color: z.string().nullable().optional(),
    icon: fileRefSchema.nullable().optional(),
    createdAt: dateLikeSchema,
    updatedAt: dateLikeSchema,
  })
  .passthrough();

export type Specialization = z.infer<typeof SpecializationSchema>;

export const CreateSpecializationDtoSchema = z.object({
  name: z.string(),
  color: z.string().optional(),
  icon: fileSchema.optional(),
});
export type CreateSpecializationDto = z.infer<typeof CreateSpecializationDtoSchema>;

export const UpdateSpecializationDtoSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  color: z.string().optional(),
  icon: fileSchema.optional(),
});
export type UpdateSpecializationDto = z.infer<typeof UpdateSpecializationDtoSchema>;

export const SetUserSpecializationsDtoSchema = z.object({
  userId: z.string(),
  specializationIds: z.array(z.string()),
});
export type SetUserSpecializationsDto = z.infer<typeof SetUserSpecializationsDtoSchema>;
