'use client';

import { ApiModel } from '../api-model';
import type { RulesContent, UpdateRulesDto } from './rules.schemas';

export type * from './rules.schemas';
export * from './rules.schemas';

class RulesApi extends ApiModel {
  getRules = async () => {
    return await this.instance.get<RulesContent>('/rules');
  };

  updateRules = async (dto: UpdateRulesDto) => {
    return await this.instance.put<RulesContent>('/rules', dto);
  };
}

export const rulesApi = new RulesApi();
export { RulesApi };
