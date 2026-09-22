import { z } from 'zod';
import { dateLikeSchema, fileRefSchema, fileSchema } from '../api-model';

export const AchievementSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    icon: fileRefSchema.nullable().optional(),
    createdAt: dateLikeSchema.optional(),
    updatedAt: dateLikeSchema.optional(),
  })
  .passthrough();

export type Achievement = z.infer<typeof AchievementSchema>;

export const CreateAchievementDtoSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: fileSchema,
});
export type CreateAchievementDto = z.infer<typeof CreateAchievementDtoSchema>;

export const UpdateAchievementDtoSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  icon: fileSchema.optional(),
});
export type UpdateAchievementDto = z.infer<typeof UpdateAchievementDtoSchema>;

export const SetUserAchievementsDtoSchema = z.object({
  userId: z.string(),
  achievementIds: z.array(z.string()),
});
export type SetUserAchievementsDto = z.infer<typeof SetUserAchievementsDtoSchema>;
