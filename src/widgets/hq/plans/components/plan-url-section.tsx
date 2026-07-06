'use client';

import { observer } from 'mobx-react-lite';

import { HeadquartersGamePlan } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { FormReadonlyField } from '@/shared/ui/atoms/form-readonly-field';
import { Input } from '@/shared/ui/atoms/input';
import { CopyIcon } from 'lucide-react';

import { copyToClipboard } from '../lib';
import { HqPlansModel } from '../model';

type PlanUrlSectionProps = {
  model: HqPlansModel;
  selectedPlan: HeadquartersGamePlan;
  canEditCommanderFields: boolean;
};

export const PlanUrlSection = observer(({ model, selectedPlan, canEditCommanderFields }: PlanUrlSectionProps) => {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
        Маркери або посилання на план |{' '}
        <a
          className="text-xs tracking-normal underline"
          href="https://arma-plan-maker.com"
          target="_blank"
          rel="noopener noreferrer">
          Arma Plan Maker
        </a>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="shrink-0 px-2"
          disabled={!selectedPlan.planUrl?.trim()}
          title="Копіювати посилання"
          aria-label="Копіювати посилання на план"
          onClick={() =>
            void copyToClipboard(selectedPlan.planUrl ?? '', {
              successMessage: 'Скопійовано',
            })
          }>
          <CopyIcon className="size-4" />
        </Button>
        {canEditCommanderFields ? (
          <Input
            className="min-w-0 flex-1"
            value={model.planUrlDraft ?? selectedPlan.planUrl ?? ''}
            placeholder="https://..."
            onChange={event => {
              model.planUrlDraft = event.target.value;
            }}
            onBlur={event => {
              void model.updatePlanUrl(selectedPlan.id, event.target.value.trim());
            }}
          />
        ) : selectedPlan.planUrl?.trim() ? (
          <a
            className="min-w-0 flex-1 truncate rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-lime-300 underline-offset-4 hover:underline"
            href={selectedPlan.planUrl}
            target="_blank"
            rel="noopener noreferrer">
            {selectedPlan.planUrl}
          </a>
        ) : (
          <FormReadonlyField className="min-w-0 flex-1" value="" />
        )}
      </div>
    </div>
  );
});
