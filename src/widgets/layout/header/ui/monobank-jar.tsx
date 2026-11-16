'use client';

import { HeartIcon } from 'lucide-react';

import { FC, useEffect, useState } from 'react';

import { env } from '@/shared/config/env';
import { cn } from '@/shared/utils/cn';

type JarData = {
  amount: number;
  goal: number;
  title: string;
  closed: boolean;
};

const formatUah = (value: number) =>
  new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 }).format(Math.floor(value)) + ' ₴';

// Кеш на рівні модуля: шапка перемонтовується при переході між сторінками,
// і без нього віджет щоразу зникав би й заново вантажив дані.
let cachedJar: JarData | null | undefined;
let jarRequest: Promise<JarData | null> | null = null;

const loadJar = () => {
  jarRequest ??= fetch('/api/monobank-jar')
    .then(res => (res.ok ? res.json() : null))
    .then((data: JarData | null) => (data && typeof data.amount === 'number' ? data : null))
    .catch(() => null)
    .then(data => {
      cachedJar = data;
      return data;
    });

  return jarRequest;
};

const useMonobankJar = () => {
  const [jar, setJar] = useState<JarData | null | undefined>(cachedJar);

  useEffect(() => {
    if (!env.isMonobankJarEnabled || cachedJar !== undefined) return;

    let cancelled = false;

    loadJar().then(data => {
      if (!cancelled) setJar(data);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // undefined — ще вантажиться, null — немає даних.
  return { jar, isLoading: jar === undefined };
};

const MonobankJarSkeleton: FC<{ className?: string; stacked: boolean }> = ({ className, stacked }) => (
  <div aria-hidden className={cn('flex animate-pulse', stacked ? 'flex-col gap-1.5' : 'items-center gap-2', className)}>
    {stacked && (
      <span className="flex items-center justify-between">
        <span className="h-3 w-24 rounded-sm bg-white/10" />
        <span className="h-3 w-6 rounded-sm bg-white/10" />
      </span>
    )}
    <span className={cn('h-5 rounded-md bg-white/10', !stacked && 'w-44')} />
    {!stacked && <span className="h-3 w-6 rounded-sm bg-white/10" />}
  </div>
);

export const SupportProjectButton: FC<{ className?: string; onClick?: () => void }> = ({ className, onClick }) => {
  if (!env.isMonobankJarEnabled) return null;

  return (
    <a
      href={env.monobankJar.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary/90 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-primary',
        className,
      )}>
      <HeartIcon className="size-3 shrink-0" />
      Підтримати
    </a>
  );
};

export const MonobankJarProgress: FC<{ className?: string; layout?: 'inline' | 'stacked' }> = ({
  className,
  layout = 'inline',
}) => {
  const { jar, isLoading } = useMonobankJar();
  const stacked = layout === 'stacked';

  if (isLoading) return <MonobankJarSkeleton className={className} stacked={stacked} />;
  if (!jar || jar.closed) return null;

  const hasGoal = jar.goal > 0;
  const percent = hasGoal ? Math.min(100, Math.round((jar.amount / jar.goal) * 100)) : 0;
  const label = `${formatUah(jar.amount)} / ${formatUah(jar.goal)}`;

  return (
    <a
      href={env.monobankJar.url}
      target="_blank"
      rel="noopener noreferrer"
      title={jar.title}
      className={cn(
        'group flex text-[11px] font-semibold whitespace-nowrap tracking-[0.06em] text-zinc-400 transition-colors hover:text-white',
        stacked ? 'flex-col gap-1.5' : 'items-center gap-2',
        className,
      )}>
      {stacked && (
        <span className="flex items-center justify-between">
          <span className="truncate text-zinc-300">{jar.title}</span>
          {hasGoal && <span>{percent}%</span>}
        </span>
      )}
      {hasGoal ? (
        <>
          <span
            className={cn(
              'relative h-5 overflow-hidden rounded-md bg-white/10 text-[10px] font-bold tracking-[0.04em] text-white tabular-nums',
              !stacked && 'w-44',
            )}
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={label}>
            <span className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${percent}%` }} />
            <span className="absolute inset-0 flex items-center justify-center">{label}</span>
          </span>
          {!stacked && <span>{percent}%</span>}
        </>
      ) : (
        <span className="text-zinc-200 group-hover:text-white">{formatUah(jar.amount)}</span>
      )}
    </a>
  );
};

export const MonobankJar: FC<{ className?: string }> = ({ className }) => {
  if (!env.isMonobankJarEnabled) return null;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <MonobankJarProgress />
      <SupportProjectButton />
    </div>
  );
};
