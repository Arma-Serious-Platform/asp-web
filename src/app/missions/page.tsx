'use client';

import { Layout } from '@/widgets/layout';
import { MissionCard } from '@/app/missions/ui/mission-card';
import { Button } from '@/shared/ui/atoms/button';
import { MissionStatus, MissionType, MissionObjective, State } from '@/shared/sdk/types';
import { cn } from '@/shared/utils/cn';

import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState, Suspense } from 'react';
import { PlusIcon, SlidersHorizontalIcon } from 'lucide-react';
import { missionsState } from './state/missions-page.state';

import { CreateMissionModal } from './ui/create-mission';
import { MissionFilters, type MissionFiltersState } from './ui/mission-filters';
import { MissionSortControls } from './ui/mission-sort-controls';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/config/routes';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { View } from '@/features/view';
import { session } from '@/entities/session/session.state';

const MissionsPageContent = observer(() => {
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFiltersState] = useQueryStates({
    search: parseAsString,
    status: parseAsStringEnum(Object.values(MissionStatus)),
    state: parseAsStringEnum(Object.values(State)),
    islandId: parseAsString,
    authorId: parseAsString,
    reviewerId: parseAsString,
    minSlots: parseAsInteger,
    maxSlots: parseAsInteger,
    minSlotsToPlay: parseAsInteger,
    missionType: parseAsStringEnum(Object.values(MissionType)),
    missionObjective: parseAsStringEnum(Object.values(MissionObjective)),
    orderType: parseAsStringEnum(['asc', 'desc']).withDefault('desc'),
  });

  const isFilterApplied = useMemo(() => {
    const { orderType, ...filterValues } = filters;
    return Object.values(filterValues).some(value =>
      value !== undefined && typeof value === 'number' ? true : Boolean(value),
    );
  }, [filters]);

  const setFilters = (patch: Partial<MissionFiltersState>) => {
    void setFiltersState(patch);
  };

  const getMissionParams = (orderType: 'asc' | 'desc' = filters.orderType) => ({
    authorId: filters.authorId || undefined,
    reviewerId: filters.reviewerId || undefined,
    status: filters.status || undefined,
    state: filters.state || undefined,
    islandId: filters.islandId || undefined,
    search: filters.search || undefined,
    minSlots: filters.minSlots ?? undefined,
    maxSlots: filters.maxSlots ?? undefined,
    minSlotsToPlay: filters.minSlotsToPlay ?? undefined,
    missionType: filters.missionType || undefined,
    missionObjective: filters.missionObjective || undefined,
    orderBy: 'createdAt' as const,
    orderType,
    take: 25,
  });

  const handleSortChange = (orderType: 'asc' | 'desc') => {
    if (orderType === filters.orderType) return;

    void setFiltersState({ orderType });
    void missionsState.missionsPagination.init({
      ...getMissionParams(orderType),
      skip: 0,
    });
  };

  const applyFilters = () => {
    missionsState.missionsPagination.init({
      ...getMissionParams(),
      skip: 0,
    });
    setMobileFiltersOpen(false);
  };

  const resetFilters = () => {
    void setFiltersState({
      search: null,
      status: null,
      state: null,
      islandId: null,
      authorId: null,
      reviewerId: null,
      minSlots: null,
      maxSlots: null,
      minSlotsToPlay: null,
      missionType: null,
      missionObjective: null,
    });

    missionsState.missionsPagination.init({
      skip: 0,
      take: 25,
      orderBy: 'createdAt',
      orderType: filters.orderType,
    });
    setMobileFiltersOpen(false);
  };

  useEffect(() => {
    if (!session.isSessionReady) return;

    if (!session.isAuthorized) {
      router.push(ROUTES.auth.login);
    }
  }, [router, session.isAuthorized, session.isSessionReady]);

  useEffect(() => {
    if (!session.isSessionReady || !session.isAuthorized) return;

    missionsState.init({
      ...getMissionParams(),
    });
  }, [session.isAuthorized, session.isSessionReady]);

  const handleCreateMission = () => {
    missionsState.createMissionState.visibility.open();
  };

  const handleMissionCreated = (missionId: string) => {
    router.push(ROUTES.missions.id(missionId));
  };

  const isLoading = missionsState.missionsPagination.loader.isLoading;
  const missions = missionsState.missionsPagination.data;
  const hasNoMissions = !isLoading && missions.length === 0;

  if (!session.isSessionReady || !session.isAuthorized) {
    return null;
  }

  return (
    <Layout showHero={false} className="container paper mx-auto my-2 sm:my-4">
      <CreateMissionModal state={missionsState.createMissionState} onSuccess={handleMissionCreated} />
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:py-8">
        {/* Mobile header */}
        <div className="mb-4 flex flex-col gap-3 lg:hidden">
          <div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold leading-tight tracking-tight text-white">Місії</h1>
                <MissionSortControls orderType={filters.orderType} onChange={handleSortChange} />
              </div>
            </div>
            <p className="mt-1 text-sm text-zinc-400">Перегляньте доступні місії або створіть нову</p>
          </div>

          <div className="flex gap-2">
            <View.Condition if={session.isAuthorized}>
              <Button variant="default" onClick={handleCreateMission} className="min-w-0 flex-1">
                <PlusIcon className="size-4 shrink-0" />
                <span className="truncate">Створити місію</span>
              </Button>
            </View.Condition>

            <Button
              type="button"
              variant={mobileFiltersOpen ? 'default' : 'outline'}
              className={cn('shrink-0', !session.isAuthorized && 'flex-1')}
              onClick={() => setMobileFiltersOpen(open => !open)}
              aria-expanded={mobileFiltersOpen}>
              <SlidersHorizontalIcon className="size-4" />
              <span>Фільтри</span>
              {isFilterApplied && <span className="ml-0.5 flex size-2 rounded-full bg-lime-400" aria-hidden />}
            </Button>
          </div>

          {mobileFiltersOpen && (
            <aside className="rounded-xl border border-white/10 bg-black/40 p-4 shadow-md">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-400">Фільтри</h2>
              <MissionFilters
                filters={filters}
                setFilters={setFilters}
                isFilterApplied={isFilterApplied}
                onApply={applyFilters}
                onReset={resetFilters}
              />
            </aside>
          )}
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-6">
          {/* Desktop filters sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24">
              <h2 className="mb-4 text-xl font-semibold text-white">Фільтри</h2>
              <MissionFilters
                filters={filters}
                setFilters={setFilters}
                isFilterApplied={isFilterApplied}
                onApply={applyFilters}
                onReset={resetFilters}
              />
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1">
            <div className="mb-6 hidden lg:block lg:mb-8">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">Місії</h1>
                <MissionSortControls orderType={filters.orderType} onChange={handleSortChange} />
              </div>
              <p className="text-zinc-400">Перегляньте доступні місії або створіть нову</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-zinc-400">Завантаження...</div>
              </div>
            ) : hasNoMissions ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/30 px-4 py-12 text-center sm:py-16">
                <p className="text-base font-medium text-zinc-200">
                  {isFilterApplied ? 'За обраними фільтрами місій не знайдено' : 'Місій поки немає'}
                </p>
                <p className="mt-2 max-w-sm text-sm text-zinc-500">
                  {isFilterApplied
                    ? 'Спробуйте змінити або скинути фільтри.'
                    : 'Поверніться пізніше або створіть нову місію.'}
                </p>
                {isFilterApplied && (
                  <Button variant="outline" className="mt-4 w-full sm:w-auto" onClick={resetFilters}>
                    Скинути фільтри
                  </Button>
                )}
                <View.Condition if={session.isAuthorized && !isFilterApplied}>
                  <Button variant="default" className="mt-4 w-full sm:w-auto" onClick={handleCreateMission}>
                    <PlusIcon className="size-4" />
                    Створити місію
                  </Button>
                </View.Condition>
              </div>
            ) : (
              <>
                <View.Condition if={session.isAuthorized}>
                  <div className="mb-4 hidden lg:flex">
                    <Button variant="default" onClick={handleCreateMission}>
                      <PlusIcon className="size-4" />
                      Створити місію
                    </Button>
                  </div>
                </View.Condition>

                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {missions.map(mission => (
                    <MissionCard key={mission.id} mission={mission.data} />
                  ))}
                </div>
              </>
            )}

            {!hasNoMissions && missionsState.missionsPagination.canLoadMore && (
              <Button
                variant="outline"
                className="mx-auto mt-2 w-full sm:mt-0 sm:w-fit"
                onClick={() => missionsState.missionsPagination.loadMore()}>
                <span className="text-center text-sm sm:text-base">
                  Показати більше: {missionsState.missionsPagination.data.length} з{' '}
                  {missionsState.missionsPagination.total}
                </span>
              </Button>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
});

const MissionsPage = () => {
  return (
    <Suspense
      fallback={
        <Layout showHero={false} className="container paper mx-auto my-2 sm:my-4">
          <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-zinc-400">Завантаження...</div>
            </div>
          </div>
        </Layout>
      }>
      <MissionsPageContent />
    </Suspense>
  );
};

export default MissionsPage;
