'use client';

import { Layout } from '@/widgets/layout';
import { MissionCard } from '@/app/missions/ui/mission-card';
import { Button } from '@/shared/ui/atoms/button';
import { MissionStatus, MissionType, MissionObjective, State } from '@/shared/sdk/types';
import { cn } from '@/shared/utils/cn';

import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { PlusIcon, SlidersHorizontalIcon } from 'lucide-react';
import { MISSIONS_PAGE_SIZE, missionsState } from './state/missions-page.state';

import { CreateMissionModal } from './ui/create-mission';
import { MissionFilters, type MissionFiltersState } from './ui/mission-filters';
import { MissionSortControls } from './ui/mission-sort-controls';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/config/routes';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { View } from '@/features/view';
import { session } from '@/entities/session/session.state';
import { MissionOrderBySchema, MissionOrderTypeSchema } from '@/shared/sdk/types';

const MissionsPageContent = observer(() => {
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const hasLoadedPageExtras = useRef(false);
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
    orderBy: parseAsStringEnum(MissionOrderBySchema.options).withDefault(MissionOrderBySchema.enum.createdAt),
    orderType: parseAsStringEnum(MissionOrderTypeSchema.options).withDefault(MissionOrderTypeSchema.enum.desc),
  });

  /** Draft edits in the sidebar; URL `filters` stay as the last applied / navigated state. */
  const [draftFilters, setDraftFilters] = useState<MissionFiltersState>(filters);

  const hasFilterValues = (value: MissionFiltersState) => {
    const { orderType: _orderType, orderBy: _orderBy, ...filterValues } = value;
    return Object.values(filterValues).some(entry =>
      entry !== undefined && typeof entry === 'number' ? true : Boolean(entry),
    );
  };

  const isFilterApplied = useMemo(() => hasFilterValues(filters), [filters]);
  const canResetFilters = useMemo(
    () => hasFilterValues(filters) || hasFilterValues(draftFilters),
    [filters, draftFilters],
  );

  /** Applied URL query — changes from Apply/Reset, sort, or external links like header "Мої місії". */
  const appliedFiltersKey = useMemo(
    () =>
      JSON.stringify({
        search: filters.search,
        authorId: filters.authorId,
        reviewerId: filters.reviewerId,
        status: filters.status,
        state: filters.state,
        islandId: filters.islandId,
        minSlots: filters.minSlots,
        maxSlots: filters.maxSlots,
        minSlotsToPlay: filters.minSlotsToPlay,
        missionType: filters.missionType,
        missionObjective: filters.missionObjective,
        orderBy: filters.orderBy,
        orderType: filters.orderType,
      }),
    [filters],
  );

  const setDraftFilterPatch = (patch: Partial<MissionFiltersState>) => {
    setDraftFilters(current => ({ ...current, ...patch }));
  };

  const getMissionParams = (source: MissionFiltersState = filters) => ({
    authorId: source.authorId || undefined,
    reviewerId: source.reviewerId || undefined,
    status: source.status || undefined,
    state: source.state || undefined,
    islandId: source.islandId || undefined,
    search: source.search || undefined,
    minSlots: source.minSlots ?? undefined,
    maxSlots: source.maxSlots ?? undefined,
    minSlotsToPlay: source.minSlotsToPlay ?? undefined,
    missionType: source.missionType || undefined,
    missionObjective: source.missionObjective || undefined,
    orderBy: source.orderBy,
    orderType: source.orderType,
    take: MISSIONS_PAGE_SIZE,
  });

  const handleSortChange = (value: {
    orderBy: MissionFiltersState['orderBy'];
    orderType: MissionFiltersState['orderType'];
  }) => {
    if (value.orderBy === filters.orderBy && value.orderType === filters.orderType) return;
    void setFiltersState({ orderBy: value.orderBy, orderType: value.orderType });
  };

  const applyFilters = () => {
    void setFiltersState({
      search: draftFilters.search,
      status: draftFilters.status,
      state: draftFilters.state,
      islandId: draftFilters.islandId,
      authorId: draftFilters.authorId,
      reviewerId: draftFilters.reviewerId,
      minSlots: draftFilters.minSlots,
      maxSlots: draftFilters.maxSlots,
      minSlotsToPlay: draftFilters.minSlotsToPlay,
      missionType: draftFilters.missionType,
      missionObjective: draftFilters.missionObjective,
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
    setDraftFilters(current => ({
      ...current,
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
    }));
    setMobileFiltersOpen(false);
  };

  useEffect(() => {
    if (!session.isSessionReady) return;

    if (!session.isAuthorized) {
      hasLoadedPageExtras.current = false;
      router.push(ROUTES.auth.login);
    }
  }, [router, session.isAuthorized, session.isSessionReady]);

  useEffect(() => {
    if (!session.isSessionReady || !session.isAuthorized) return;

    setDraftFilters(filters);

    const params = {
      ...getMissionParams(filters),
      skip: 0,
    };

    if (!hasLoadedPageExtras.current) {
      hasLoadedPageExtras.current = true;
      void missionsState.init(params);
      return;
    }

    void missionsState.missionsPagination.init(params);
  }, [session.isAuthorized, session.isSessionReady, appliedFiltersKey]);

  const handleCreateMission = () => {
    missionsState.createMissionState.visibility.open();
  };

  const handleMissionCreated = (missionId: string) => {
    router.push(ROUTES.missions.id(missionId));
  };

  const isLoading = missionsState.missionsPagination.loader.isLoading;
  const missions = missionsState.missionsPagination.data;
  const hasNoMissions = !isLoading && missions.length === 0;

  useEffect(() => {
    return () => {
      missionsState.pageLoader.start();
    };
  }, []);

  if (!session.isSessionReady || !session.isAuthorized) {
    return null;
  }

  return (
    <Layout showHero={false} className="container paper mx-auto my-2 sm:my-4">
      <CreateMissionModal state={missionsState.createMissionState} onSuccess={handleMissionCreated} />
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:py-8">
        {/* Mobile header */}
        <div className="mb-3 flex flex-col gap-3 lg:hidden">
          <div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold leading-tight tracking-tight text-white">Місії</h1>
              </div>
              <MissionSortControls
                value={{ orderBy: filters.orderBy, orderType: filters.orderType }}
                onChange={handleSortChange}
              />
            </div>
            <p className="mt-1 text-sm text-zinc-400">Перегляньте доступні місії або створіть нову</p>
          </div>
        </div>

        {/* Sticky under layout header (h-16). Must stay a sibling of the list, not inside a short wrapper. */}
        <div
          className={cn(
            'sticky top-16 z-20 -mx-3 mb-4 flex flex-col gap-3 border-b border-white/10 bg-card/95 px-3 py-3 backdrop-blur-md sm:-mx-4 sm:px-4 lg:hidden',
            mobileFiltersOpen && 'h-[calc(100dvh-4rem)]',
          )}>
          <div className="flex shrink-0 gap-2">
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
            <aside className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-4 shadow-md">
              <h2 className="mb-3 shrink-0 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-400">Фільтри</h2>
              <div className="min-h-0 flex-1">
                <MissionFilters
                  filters={draftFilters}
                  setFilters={setDraftFilterPatch}
                  isFilterApplied={canResetFilters}
                  onApply={applyFilters}
                  onReset={resetFilters}
                />
              </div>
            </aside>
          )}
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-6">
          {/* Desktop filters sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24">
              <h2 className="mb-4 text-xl font-semibold text-white">Фільтри</h2>
              <MissionFilters
                filters={draftFilters}
                setFilters={setDraftFilterPatch}
                isFilterApplied={canResetFilters}
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
                <MissionSortControls
                  value={{ orderBy: filters.orderBy, orderType: filters.orderType }}
                  onChange={handleSortChange}
                />
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
                className="mx-auto mt-2 w-full sm:mt-0 sm:w-fit flex"
                onClick={() => missionsState.missionsPagination.loadMore()}>
                <span className="text-center text-sm sm:text-base">Показати більше</span>
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
