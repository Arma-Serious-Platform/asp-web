'use client';

import { Layout } from '@/widgets/layout';
import { UserNicknameText } from '@/entities/user/ui/user-text';
import { tribunalApi } from '@/shared/sdk';
import { TribunalComplaint } from '@/shared/sdk/tribunal/tribunal.schemas';
import { Button } from '@/shared/ui/atoms/button';
import { Card } from '@/shared/ui/atoms/card';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/utils/cn';
import dayjs from 'dayjs';
import { EyeIcon, LoaderIcon, PlusIcon, SlidersHorizontalIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { ComplaintFilters, ComplaintFiltersState } from './ui/complaint-filters';
import { ComplaintForm } from './ui/complaint-form';

const statuses = ['OPEN', 'IN_PROGRESS', 'PUNISHED', 'REJECTED'] as const;

const statusLabel: Record<TribunalComplaint['status'], string> = {
  OPEN: 'Нова',
  IN_PROGRESS: 'В роботі',
  PUNISHED: 'Закрита',
  REJECTED: 'Закрита',
};

const badgeClass: Record<TribunalComplaint['status'], string> = {
  OPEN: 'bg-amber-400/15 text-amber-100',
  IN_PROGRESS: 'bg-sky-400/15 text-sky-100',
  PUNISHED: 'bg-lime-400/10 text-lime-200',
  REJECTED: 'bg-white/10 text-zinc-300',
};

const punishmentLabel: Record<TribunalComplaint['punishmentKind'], string> = {
  NONE: 'Без покарання',
  WARNING: 'Попередження',
  TEMP_BAN: 'Тимчасовий бан',
  PERMANENT_BAN: 'Перманентний бан',
};

const pageSize = 20;

const formatPunishment = (complaint: TribunalComplaint) => {
  const label = punishmentLabel[complaint.punishmentKind];

  if (complaint.punishmentKind === 'WARNING' && complaint.warningWeight) {
    return `${label} · ${complaint.warningWeight}`;
  }

  return label;
};

const emptyFilters: ComplaintFiltersState = {
  status: null,
  authorId: null,
  targetUserId: null,
  assigneeId: null,
};

const TribunalPageContent = observer(() => {
  const router = useRouter();
  const [complaints, setComplaints] = useState<TribunalComplaint[]>([]);
  const [total, setTotal] = useState(0);
  const [authors, setAuthors] = useState<{ id: string; nickname: string }[]>([]);
  const [targets, setTargets] = useState<{ id: string; nickname: string }[]>([]);
  const [assignees, setAssignees] = useState<{ id: string; nickname: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFiltersState] = useQueryStates({
    status: parseAsStringEnum([...statuses]),
    authorId: parseAsString,
    targetUserId: parseAsString,
    assigneeId: parseAsString,
    page: parseAsInteger.withDefault(1),
  });
  const [draftFilters, setDraftFilters] = useState<ComplaintFiltersState>(filters);

  const hasFilterValues = (value: ComplaintFiltersState) =>
    Boolean(value.status || value.authorId || value.targetUserId || value.assigneeId);

  const isFilterApplied = useMemo(() => hasFilterValues(filters), [filters]);
  const canResetFilters = hasFilterValues(filters) || hasFilterValues(draftFilters);

  const appliedFiltersKey = useMemo(
    () =>
      JSON.stringify({
        status: filters.status,
        authorId: filters.authorId,
        targetUserId: filters.targetUserId,
        assigneeId: filters.assigneeId,
        page: filters.page,
      }),
    [filters],
  );

  useEffect(() => {
    setDraftFilters(filters);
    setLoading(true);
    tribunalApi
      .findComplaints({
        status: filters.status || undefined,
        authorId: filters.authorId || undefined,
        targetUserId: filters.targetUserId || undefined,
        assigneeId: filters.assigneeId || undefined,
        take: pageSize,
        skip: (Math.max(filters.page, 1) - 1) * pageSize,
      })
      .then(({ data }) => {
        setComplaints(data.items);
        setTotal(data.total);
      })
      .catch(() => {
        setComplaints([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [appliedFiltersKey]);

  useEffect(() => {
    tribunalApi
      .findFilters()
      .then(({ data }) => {
        setAuthors(data.authors);
        setTargets(data.targets);
        setAssignees(data.assignees);
      })
      .catch(() => {
        setAuthors([]);
        setTargets([]);
        setAssignees([]);
      });
  }, []);

  const applyFilters = () => {
    void setFiltersState({
      status: draftFilters.status,
      authorId: draftFilters.authorId,
      targetUserId: draftFilters.targetUserId,
      assigneeId: draftFilters.assigneeId,
      page: 1,
    });
    setMobileFiltersOpen(false);
  };

  const resetFilters = () => {
    void setFiltersState({
      status: null,
      authorId: null,
      targetUserId: null,
      assigneeId: null,
      page: 1,
    });
    setDraftFilters(emptyFilters);
    setMobileFiltersOpen(false);
  };

  const filtersPanel = (
    <ComplaintFilters
      filters={draftFilters}
      authors={authors}
      targets={targets}
      assignees={assignees}
      isFilterApplied={canResetFilters}
      onChange={patch => setDraftFilters(current => ({ ...current, ...patch }))}
      onApply={applyFilters}
      onReset={resetFilters}
    />
  );

  return (
    <Layout className="container paper mx-auto my-2 sm:my-4">
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:py-8">
        <div className="mb-3 flex items-center justify-between gap-3 lg:hidden">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Трибунал <span className="text-base font-medium text-zinc-400">({total})</span>
          </h1>
        </div>

        <div
          className={cn(
            'sticky top-16 z-20 -mx-3 mb-4 flex flex-col gap-3 border-b border-white/10 bg-card/95 px-3 py-3 backdrop-blur-md sm:-mx-4 sm:px-4 lg:hidden',
            mobileFiltersOpen && 'h-[calc(100dvh-4rem)]',
          )}>
          <div className="flex shrink-0 gap-2">
            <Button className="min-w-0 flex-1" onClick={() => setCreating(true)}>
              <PlusIcon className="size-4 shrink-0" />
              <span className="truncate">Подати скаргу</span>
            </Button>
            <Button
              type="button"
              variant={mobileFiltersOpen ? 'default' : 'outline'}
              className="shrink-0"
              onClick={() => setMobileFiltersOpen(open => !open)}
              aria-expanded={mobileFiltersOpen}>
              <SlidersHorizontalIcon className="size-4" />
              Фільтри
              {isFilterApplied && <span className="ml-0.5 size-2 rounded-full bg-lime-400" />}
            </Button>
          </div>
          {mobileFiltersOpen && (
            <aside className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-4 shadow-md">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-400">Фільтри</h2>
              {filtersPanel}
            </aside>
          )}
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <h2 className="mb-4 text-xl font-semibold text-white">Фільтри</h2>
              {filtersPanel}
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="mb-6 hidden lg:block">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Трибунал <span className="text-xl font-medium text-zinc-400">({total})</span>
              </h1>
            </div>

            <div className="mb-4 hidden lg:flex">
              <Button onClick={() => setCreating(true)}>
                <PlusIcon className="size-4" />
                Подати скаргу
              </Button>
            </div>

            {creating && (
              <div className="mb-4">
                <ComplaintForm
                  onCancel={() => setCreating(false)}
                  onCreated={id => {
                    setCreating(false);
                    router.push(ROUTES.tribunalById(id));
                  }}
                />
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-zinc-400">
                <LoaderIcon className="size-4 animate-spin" />
                Завантаження...
              </div>
            ) : complaints.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-white/15 bg-black/30 px-4 py-12 text-center">
                <p className="text-base font-medium text-zinc-200">
                  {isFilterApplied ? 'За обраними фільтрами скарг не знайдено' : 'Скарг поки немає'}
                </p>
                {isFilterApplied && (
                  <Button variant="outline" className="mt-4" onClick={resetFilters}>
                    Скинути фільтри
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {complaints.map(complaint => (
                  <Card
                    key={complaint.id}
                    className={cn(
                      complaint.status === 'PUNISHED' || complaint.status === 'REJECTED' ? 'opacity-80' : '',
                    )}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-zinc-100">
                        Скарга №{complaint.number}
                        {complaint.ruleNumber ? ` · правило ${complaint.ruleNumber}` : ''}
                      </span>
                      <span className={cn('rounded px-2 py-0.5 text-xs', badgeClass[complaint.status])}>
                        {statusLabel[complaint.status]}
                        {complaint.status === 'PUNISHED' ? ' · покарання' : ''}
                        {complaint.status === 'REJECTED' ? ' · відхилено' : ''}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-zinc-300">
                      <UserNicknameText user={complaint.author} />
                      <span className="mx-1 text-zinc-500">→</span>
                      <UserNicknameText user={complaint.target} />
                    </div>
                    <div className="mt-1 text-xs text-zinc-400">
                      Адмін:{' '}
                      {complaint.assignee ? <UserNicknameText user={complaint.assignee} /> : 'не призначено'}
                    </div>
                    {complaint.resolvedBy && (
                      <div className="mt-1 text-xs text-zinc-400">
                        Розглянув <UserNicknameText user={complaint.resolvedBy} />
                      </div>
                    )}
                    <div className="mt-1 text-xs text-zinc-500">
                      Порушення {dayjs(complaint.violatedAt).format('DD.MM.YYYY HH:mm')}
                      {complaint.game?.mission?.name ? ` · ${complaint.game.mission.name}` : ''}
                      {' · '}
                      {formatPunishment(complaint)}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="mt-3"
                      onClick={() => router.push(ROUTES.tribunalById(complaint.id))}>
                      <EyeIcon className="size-4" />
                      Переглянути
                    </Button>
                  </Card>
                ))}
                {total > pageSize && (
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={filters.page <= 1}
                      onClick={() => void setFiltersState({ page: filters.page - 1 })}>
                      Назад
                    </Button>
                    <span className="text-sm text-zinc-400">
                      {filters.page} / {Math.ceil(total / pageSize)}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={filters.page * pageSize >= total}
                      onClick={() => void setFiltersState({ page: filters.page + 1 })}>
                      Далі
                    </Button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
});

const TribunalPage = () => (
  <Suspense
    fallback={
      <Layout className="container paper mx-auto my-2 sm:my-4">
        <div className="flex items-center justify-center py-12 text-zinc-400">Завантаження...</div>
      </Layout>
    }>
    <TribunalPageContent />
  </Suspense>
);

export default TribunalPage;
