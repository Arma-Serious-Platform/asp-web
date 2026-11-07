'use client';

import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import {
  CrosshairIcon,
  FlagIcon,
  HandshakeIcon,
  LucideIcon,
  SearchXIcon,
  SkullIcon,
  SwordsIcon,
  TriangleAlertIcon,
  UnplugIcon,
  UserIcon,
  UserXIcon,
} from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { FC, ReactNode, useEffect } from 'react';

import { UserNicknameText } from '@/entities/user/ui/user-text';
import type { PlayerStatsTrend } from '@/shared/sdk/stats/stats.schemas';
import type { User } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Preloader } from '@/shared/ui/atoms/preloader';
import { cn } from '@/shared/utils/cn';
import type { UserStatsState } from '../state/user-stats.state';

type Metric = {
  label: string;
  icon: LucideIcon;
  text: string;
  border: string;
  badge: string;
};

const METRICS = {
  kills: {
    label: 'Вбивства',
    icon: SwordsIcon,
    text: 'text-emerald-500',
    border: 'border-t-emerald-500',
    badge: 'bg-emerald-500/15',
  },
  deaths: {
    label: 'Смерті',
    icon: SkullIcon,
    text: 'text-red-500',
    border: 'border-t-red-500',
    badge: 'bg-red-500/15',
  },
  teamKills: {
    label: 'Вбивства союзників',
    icon: UserXIcon,
    text: 'text-amber-500',
    border: 'border-t-amber-500',
    badge: 'bg-amber-500/15',
  },
  assists: {
    label: 'Допомога у вбивстві',
    icon: HandshakeIcon,
    text: 'text-sky-500',
    border: 'border-t-sky-500',
    badge: 'bg-sky-500/15',
  },
  kd: {
    label: 'KD',
    icon: CrosshairIcon,
    text: 'text-violet-500',
    border: 'border-t-violet-500',
    badge: 'bg-violet-500/15',
  },
  missions: {
    label: 'Місії',
    icon: FlagIcon,
    text: 'text-lime-500',
    border: 'border-t-lime-500',
    badge: 'bg-lime-500/15',
  },
} satisfies Record<string, Metric>;

const SectionTitle: FC<{ children: string }> = ({ children }) => (
  <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">{children}</span>
);

const StatTile: FC<{ metric: Metric; label?: string; value: ReactNode; children?: ReactNode }> = ({
  metric,
  label = metric.label,
  value,
  children,
}) => {
  const Icon = metric.icon;

  return (
    <div className={cn('flex min-w-0 flex-col gap-2 rounded-md border-t-2 bg-black/40 px-3 py-2.5', metric.border)}>
      <div className="flex items-center gap-2">
        <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-md', metric.badge, metric.text)}>
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 text-xs leading-tight text-zinc-400">{label}</span>
      </div>
      <div className="text-2xl font-semibold tabular-nums text-white">{value}</div>
      {children}
    </div>
  );
};

const AccuracyMeter: FC<{ accuracy: number }> = ({ accuracy }) => {
  const value = Math.min(Math.max(accuracy, 0), 100);

  return (
    <div
      role="meter"
      aria-label="Влучність"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className="h-1 overflow-hidden rounded-full bg-violet-500/15">
      <div className="h-full rounded-full bg-violet-500" style={{ width: `${value}%` }} />
    </div>
  );
};

const TrendRow: FC<{ metric: Metric; value: number }> = ({ metric, value }) => {
  const Icon = metric.icon;

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Icon className={cn('size-3.5 shrink-0', metric.text)} />
      <span className="text-zinc-500">{metric.label}</span>
      <span className="ml-auto font-medium tabular-nums text-zinc-200">{value}</span>
    </div>
  );
};

const TrendCard: FC<{ trend: PlayerStatsTrend }> = ({ trend }) => (
  <div className="flex w-40 shrink-0 flex-col gap-1.5 rounded-md bg-black/40 px-3 py-2">
    <span className="text-sm font-semibold capitalize text-white">
      {dayjs(`${trend.month}-01`).locale('uk').format('MMMM YYYY')}
    </span>
    <TrendRow metric={METRICS.missions} value={trend.missions} />
    <TrendRow metric={METRICS.kills} value={trend.kills} />
    <TrendRow metric={METRICS.deaths} value={trend.deaths} />
    <TrendRow metric={METRICS.assists} value={trend.killAssists} />
    <TrendRow metric={METRICS.kd} value={trend.kd} />
  </div>
);

const StatsFallback: FC<{
  icon: LucideIcon;
  iconClassName: string;
  title: string;
  description: string;
  children?: ReactNode;
}> = ({ icon: Icon, iconClassName, title, description, children }) => (
  <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-white/10 bg-black/40 px-6 py-12 text-center">
    <span className={cn('flex size-14 items-center justify-center rounded-full', iconClassName)}>
      <Icon className="size-7" />
    </span>
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <p className="max-w-md text-sm leading-relaxed text-zinc-400">{description}</p>
    {children}
  </div>
);

type StatsProps = {
  model: UserStatsState;
  user?: User | null;
  isOwnProfile: boolean;
};

export const Stats: FC<StatsProps> = observer(({ model, user, isOwnProfile }) => {
  const userId = user?.id;

  useEffect(() => {
    void model.load(userId);
  }, [model, userId]);

  const { stats } = model;
  const trend = stats ? [...stats.trend].reverse() : [];

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-col items-baseline gap-x-2 gap-y-1">
          <SectionTitle>Статистика гравця</SectionTitle>
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <UserIcon className="size-5 shrink-0 text-primary" />
            <UserNicknameText user={user} tag={user?.squad?.tag} sideType={user?.squad?.side?.type} link={false} />
          </div>
        </div>

        <Preloader isLoading={model.loader.isLoading}>
          <div className="min-h-16">
            {stats && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatTile metric={METRICS.kills} value={stats.player.kills} />
                <StatTile metric={METRICS.deaths} value={stats.player.deaths} />
                <StatTile metric={METRICS.teamKills} value={stats.player.teamKills} />
                <StatTile metric={METRICS.assists} value={stats.player.killAssists} />
                <StatTile
                  metric={METRICS.kd}
                  label="KD / Влучність"
                  value={
                    <>
                      {stats.player.kd}
                      <span className="ml-2 text-sm font-medium text-zinc-400">{stats.player.accuracy}%</span>
                    </>
                  }>
                  <AccuracyMeter accuracy={stats.player.accuracy} />
                </StatTile>
                <StatTile metric={METRICS.missions} label="Зіграно місій" value={stats.missions.length} />
              </div>
            )}

            {model.steamNotConnected && (
              <StatsFallback
                icon={UnplugIcon}
                iconClassName="bg-amber-500/15 text-amber-500"
                title="Steam не підключено"
                description={
                  isOwnProfile
                    ? 'Статистика прив’язана до вашого Steam-акаунта. Підключіть Steam у розділі «Основна інформація», щоб бачити свої результати.'
                    : 'Цей гравець ще не підключив Steam-акаунт, тому його статистика недоступна.'
                }
              />
            )}

            {model.notFound && (
              <StatsFallback
                icon={SearchXIcon}
                iconClassName="bg-sky-500/15 text-sky-500"
                title="Статистики поки немає"
                description={
                  isOwnProfile
                    ? 'Ми ще не знайшли жодної зіграної вами місії. Дані з’являться після участі в місії та обробки її реплею.'
                    : 'Для цього гравця ще немає зіграних місій. Дані з’являться після участі в місії та обробки її реплею.'
                }
              />
            )}

            {model.error && (
              <StatsFallback
                icon={TriangleAlertIcon}
                iconClassName="bg-red-500/15 text-red-500"
                title="Не вдалося завантажити статистику"
                description="Сервіс статистики тимчасово недоступний або сталася помилка. Спробуйте ще раз за кілька хвилин.">
                <Button size="sm" variant="secondary" onClick={() => void model.load(userId)}>
                  Спробувати ще раз
                </Button>
              </StatsFallback>
            )}
          </div>
        </Preloader>
      </div>

      {trend.length > 0 && (
        <div className="flex min-w-0 flex-col gap-3">
          <SectionTitle>По місяцях</SectionTitle>
          <div className="flex gap-3 flex-wrap pb-2">
            {trend.map(item => (
              <TrendCard key={item.month} trend={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
