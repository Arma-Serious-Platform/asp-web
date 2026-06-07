'use client';

import { Layout } from '@/widgets/layout';
import { MissionCard } from '@/entities/mission/ui/mission-card';
import { Button } from '@/shared/ui/atoms/button';
import { Input, NumericInput } from '@/shared/ui/atoms/input';
import { Select } from '@/shared/ui/atoms/select';
import { MissionStatus, MissionType, State } from '@/shared/sdk/types';
import { cn } from '@/shared/utils/cn';

import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState, Suspense } from 'react';
import { PlusIcon, SlidersHorizontalIcon } from 'lucide-react';
import { model } from './model';

import { CreateMissionModal } from '@/features/mission/create-mission/ui';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/config/routes';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState, useQueryStates } from 'nuqs';
import { missionTypeOptions, stateOptions, statusOptions } from '@/entities/mission/lib';
import { mapUsersToSelectOptions } from '@/entities/user/ui/user-select-options';
import { View } from '@/features/view';
import { session } from '@/entities/session/model';

type MissionFiltersState = {
  search: string | null;
  status: MissionStatus | null;
  state: State | null;
  islandId: string | null;
  authorId: string | null;
  minSlots: number | null;
  maxSlots: number | null;
  missionType: MissionType | null;
  orderType: 'asc' | 'desc';
};

type MissionFiltersProps = {
  filters: MissionFiltersState;
  setFilters: (patch: Partial<MissionFiltersState>) => void;
  isFilterApplied: boolean;
  onApply: () => void;
  onReset: () => void;
  className?: string;
};

const MissionFilters = observer(
  ({ filters, setFilters, isFilterApplied, onApply, onReset, className }: MissionFiltersProps) => {
    const isLoading = model.missionModel.pagination.preloader.isLoading;

    return (
      <div className={cn('flex flex-col gap-4', className)}>
        <Input
          label="Пошук"
          placeholder="По назві"
          value={filters.search || ''}
          onChange={e => setFilters({ search: e.target.value || null })}
          searchIcon
        />

        <Select
          label="Сортування"
          options={[
            { label: 'Спочатку новіші', value: 'desc' },
            { label: 'Спочатку старіші', value: 'asc' },
          ]}
          value={filters.orderType}
          onChange={value => setFilters({ orderType: value === 'asc' ? 'asc' : 'desc' })}
        />

        <Select
          label="Тип місії"
          options={missionTypeOptions}
          value={filters.missionType || ''}
          onChange={value =>
            setFilters({
              missionType: value ? (value as MissionType) : null,
            })
          }
        />

        <Select
          label="Статус"
          options={statusOptions}
          value={filters.status || ''}
          onChange={value =>
            setFilters({
              status: value ? (value as MissionStatus) : null,
            })
          }
        />

        <Select
          label="Стан"
          options={stateOptions}
          value={filters.state || ''}
          onChange={value =>
            setFilters({
              state: value ? (value as State) : null,
            })
          }
        />

        <Select
          label="Автор"
          options={mapUsersToSelectOptions(model.userModel.pagination.data)}
          localSearch
          placeholder="Усі автори"
          value={filters.authorId || ''}
          onChange={value => setFilters({ authorId: value || null })}
        />

        <Select
          label="Карта"
          resultsClassName="max-h-[150px] overflow-y-auto"
          multiple={false}
          placeholder="Усі карти"
          options={model.missionModel.islandsOptions}
          value={filters.islandId || ''}
          localSearch
          onChange={value => setFilters({ islandId: value || null })}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
          <NumericInput
            label="Мін. слотів"
            placeholder="0"
            value={filters.minSlots?.toString() || ''}
            onChange={e =>
              setFilters({
                minSlots: e.target.value ? parseInt(e.target.value, 10) : null,
              })
            }
          />

          <NumericInput
            label="Макс. слотів"
            placeholder="0"
            value={filters.maxSlots?.toString() || ''}
            onChange={e =>
              setFilters({
                maxSlots: e.target.value ? parseInt(e.target.value, 10) : null,
              })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 sm:flex sm:flex-col sm:gap-2 sm:pt-2">
          <Button variant="outline" disabled={isLoading} onClick={onApply} className="w-full">
            Застосувати
          </Button>

          <Button variant="ghost" disabled={isLoading || !isFilterApplied} onClick={onReset} className="w-full">
            Скинути
          </Button>
        </div>
      </div>
    );
  },
);

const MissionsPageContent = observer(() => {
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFiltersState] = useQueryStates({
    search: parseAsString,
    status: parseAsStringEnum(Object.values(MissionStatus)),
    state: parseAsStringEnum(Object.values(State)),
    islandId: parseAsString,
    authorId: parseAsString,
    minSlots: parseAsInteger,
    maxSlots: parseAsInteger,
    missionType: parseAsStringEnum(Object.values(MissionType)),
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

  const applyFilters = () => {
    model.missionModel.pagination.init({
      authorId: filters.authorId || undefined,
      status: filters.status || undefined,
      state: filters.state || undefined,
      islandId: filters.islandId || undefined,
      search: filters.search || undefined,
      minSlots: filters.minSlots ?? undefined,
      maxSlots: filters.maxSlots ?? undefined,
      missionType: filters.missionType || undefined,
      orderBy: 'createdAt',
      orderType: filters.orderType,
      skip: 0,
      take: 25,
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
      minSlots: null,
      maxSlots: null,
      missionType: null,
      orderType: 'desc',
    });

    model.missionModel.pagination.init({
      skip: 0,
      take: 25,
      orderBy: 'createdAt',
      orderType: 'desc',
    });
    setMobileFiltersOpen(false);
  };

  useEffect(() => {
    model.init({
      authorId: filters.authorId || undefined,
      status: filters.status || undefined,
      state: filters.state || undefined,
      islandId: filters.islandId || undefined,
      search: filters.search || undefined,
      minSlots: filters.minSlots ?? undefined,
      maxSlots: filters.maxSlots ?? undefined,
      missionType: filters.missionType || undefined,
      orderBy: 'createdAt',
      orderType: filters.orderType,
      take: 25,
    });
  }, []);

  const handleCreateMission = () => {
    model.createMissionModel.visibility.open();
  };

  const handleMissionCreated = (missionId: string) => {
    router.push(ROUTES.missions.id(missionId));
  };

  const isLoading = model.missionModel.pagination.preloader.isLoading;
  const missions = model.missionModel.pagination.data;
  const hasNoMissions = !isLoading && missions.length === 0;

  return (
    <Layout showHero={false} className="container paper mx-auto my-2 sm:my-4">
      <CreateMissionModal model={model.createMissionModel} onSuccess={handleMissionCreated} />
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:py-8">
        {/* Mobile header */}
        <div className="mb-4 flex flex-col gap-3 lg:hidden">
          <div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-white">Місії</h1>
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
              {isFilterApplied && (
                <span className="ml-0.5 flex size-2 rounded-full bg-lime-400" aria-hidden />
              )}
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
              <h1 className="mb-2 text-3xl font-bold leading-tight tracking-tight text-white">Місії</h1>
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
                    <MissionCard key={mission.id} mission={mission} />
                  ))}
                </div>
              </>
            )}

            {!hasNoMissions && model.missionModel.pagination.canLoadMore && (
              <Button
                variant="outline"
                className="mx-auto mt-2 w-full sm:mt-0 sm:w-fit"
                onClick={() => model.missionModel.pagination.loadMore()}>
                <span className="text-center text-sm sm:text-base">
                  Показати більше: {model.missionModel.pagination.data.length} з{' '}
                  {model.missionModel.pagination.total}
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
