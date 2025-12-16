'use client';

import { FC, useState } from 'react';
import { RULE_CATEGORIES } from './config';
import { cn } from '@/shared/utils/cn';
import { ListTreeIcon, XIcon } from 'lucide-react';

const RulesMobileMenu: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className='container sticky top-20 z-20 mx-auto px-4 pb-3 lg:hidden'>
        <button
          type='button'
          onClick={() => setIsOpen(true)}
          className={cn(
            'flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-xs font-medium text-zinc-100 shadow-md transition-colors hover:border-lime-400 hover:bg-black'
          )}>
          <span>Перейти до розділу правил</span>
          <span className='inline-flex items-center gap-1 text-[11px] text-zinc-400'>
            <ListTreeIcon className='size-4' />
          </span>
        </button>
      </div>

      {isOpen && (
        <div className='fixed inset-0 z-40 flex flex-col bg-gradient-to-b from-black/95 via-neutral-950/98 to-black/95 lg:hidden'>
          <div className='mx-auto flex w-full max-w-xl flex-col px-4 pt-4'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col gap-1'>
                <span className='text-[11px] font-semibold uppercase tracking-[0.26em] text-zinc-500'>
                  Розділи правил
                </span>
                <span className='text-sm font-semibold text-white'>
                  Оберіть потрібний розділ
                </span>
              </div>
              <button
                type='button'
                aria-label='Закрити меню розділів'
                onClick={() => setIsOpen(false)}
                className='inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-black/70 text-zinc-200 shadow-md transition-colors hover:bg-white/10'>
                <XIcon className='h-5 w-5' />
              </button>
            </div>

            <div className='mt-5 flex-1 overflow-y-auto pb-6'>
              <div className='paper flex flex-col gap-1 rounded-xl border px-2 py-2 shadow-xl'>
                {RULE_CATEGORIES.map((category) => (
                  <a
                    key={category.title}
                    href={category.hash}
                    onClick={() => setIsOpen(false)}
                    className='flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/5 hover:text-white'>
                    <span>{category.title}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export { RulesMobileMenu };


