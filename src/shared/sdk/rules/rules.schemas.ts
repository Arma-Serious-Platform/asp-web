import { z } from 'zod';

export const RulesContentSchema = z.object({
  content: z.string(),
});
export type RulesContent = z.infer<typeof RulesContentSchema>;

export const UpdateRulesDtoSchema = z.object({
  content: z.string(),
});
export type UpdateRulesDto = z.infer<typeof UpdateRulesDtoSchema>;
