'use client';

import { api } from '@/shared/sdk';
import { FC, useEffect, useState } from 'react';
import { DEFAULT_RULE_SECTIONS, parseRuleSections, RuleSection } from './rules-data';
import { RulesRenderer } from './rules-renderer';

const RulesContentOverride: FC = () => {
  const [sections, setSections] = useState<RuleSection[]>(DEFAULT_RULE_SECTIONS);

  useEffect(() => {
    const loadRules = async () => {
      try {
        const { data } = await api.getRules();
        setSections(parseRuleSections(data.content));
      } catch (error) {
        console.error(error);
      }
    };

    loadRules();
  }, []);

  return <RulesRenderer sections={sections} />;
};

export { RulesContentOverride };
