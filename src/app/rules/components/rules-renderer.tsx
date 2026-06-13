'use client';

import { cn } from '@/shared/utils/cn';
import { CopyIcon } from 'lucide-react';
import { FC } from 'react';
import toast from 'react-hot-toast';
import type { RuleSection } from '../data';

const RuleCategory: FC<React.PropsWithChildren> = ({ children }) => (
  <div className="paper flex flex-col gap-4 rounded-xl border px-4 py-5 shadow-xl">{children}</div>
);

const RuleTitle: FC<React.PropsWithChildren<{ id?: string }>> = ({ children, id }) => (
  <h3 className="border-b border-white/10 pb-3 text-center text-lg font-semibold tracking-tight text-white" id={id}>
    {children}
  </h3>
);

const RuleContent: FC<{
  id: string;
  text: string;
}> = ({ id, text }) => {
  const dotCount = (id.match(/\./g) || []).length;
  const copyRuleLink = async () => {
    const ruleText = `${id} ${text}`;

    try {
      await navigator.clipboard.writeText(ruleText);
      toast.success('Правило скопійовано');
    } catch {
      toast.error('Не вдалося скопіювати правило');
    }
  };

  return (
    <div
      className={cn('pl-4 text-sm leading-relaxed text-zinc-300', {
        'pl-8': dotCount === 2,
        'pl-12': dotCount === 3,
      })}
      id={id}>
      <span className="whitespace-pre-wrap">
        <a href={`#${id}`} className="mr-1 font-mono text-xs font-semibold text-lime-400">
          {id}{' '}
        </a>
        {text}
      </span>
      <button
        type="button"
        aria-label={`Копіювати правило ${id}`}
        title="Копіювати правило"
        className="cursor-pointer ml-2 inline-flex size-6 align-text-bottom items-center justify-center rounded-md border border-white/10 bg-black/30 text-zinc-400 transition-colors hover:border-lime-500/50 hover:text-lime-300"
        onClick={copyRuleLink}>
        <CopyIcon className="size-3.5" />
      </button>
    </div>
  );
};

const RuleMenu: FC<{ sections: RuleSection[] }> = ({ sections }) => (
  <div className="paper sticky top-24 flex h-fit min-w-[260px] flex-col gap-2 rounded-xl border px-3 py-4 shadow-xl max-lg:hidden">
    <h2 className="mb-1 text-center text-sm font-semibold uppercase tracking-[0.22em] text-zinc-300">Розділи</h2>
    <div className="flex flex-col text-sm">
      {sections.map(section => (
        <a
          className="rounded-md px-3 py-2 text-left text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
          href={`#${section.id}`}
          key={section.id}>
          {section.title}
        </a>
      ))}
    </div>
  </div>
);

const RulesRenderer: FC<{ sections: RuleSection[] }> = ({ sections }) => (
  <div className="max-md:m-0 max-md:p-0 container mx-auto flex gap-4 px-4 pb-6">
    <RuleMenu sections={sections} />
    <div className="mb-1 flex w-full flex-col gap-6">
      {sections.map(section => (
        <RuleCategory key={section.id}>
          <RuleTitle id={section.id}>{section.title}</RuleTitle>
          {section.items.map(item => (
            <RuleContent key={item.id} id={item.id} text={item.text} />
          ))}
        </RuleCategory>
      ))}
    </div>
  </div>
);

export { RulesRenderer };
