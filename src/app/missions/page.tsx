'use client';

import { Layout } from '@/widgets/layout';
import { MissionModel } from '@/entities/mission/model';
import { MissionCard } from '@/entities/mission/ui/mission-card';
import { Button } from '@/shared/ui/atoms/button';
import { Input, NumericInput } from '@/shared/ui/atoms/input';
import { Select } from '@/shared/ui/atoms/select';
import { MissionStatus } from '@/shared/sdk/types';
import { UserModel } from '@/entities/user/model';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { model } from './model';
import toast from 'react-hot-toast';
import { CreateMissionModal } from '@/features/mission/create-mission/ui';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/config/routes';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState, useQueryStates } from 'nuqs';
import { statusOptions } from '@/entities/mission/lib';

const MissionsPage = observer(() => {
  const router = useRouter();
  const [filters, setFilters] = useQueryStates({
    search: parseAsString,
    status: parseAsStringEnum(Object.values(MissionStatus)),
    islandId: parseAsString,
    authorId: parseAsString,
    minSlots: parseAsInteger,
    maxSlots: parseAsInteger,
  });

  const isFilterApplied = useMemo(() => {
    return Object.values(filters).some(value => value !== undefined && typeof value === 'number' ? true : Boolean(value));
  }, [filters]);

  useEffect(() => {
    model.init({
      authorId: filters.authorId || undefined,
      status: filters.status || undefined,
      islandId: filters.islandId || undefined,
      search: filters.search || undefined,
      minSlots: filters.minSlots || undefined,
      maxSlots: filters.maxSlots || undefined,
      take: 25,
    });
  }, []);

  const handleCreateMission = () => {
    model.createMissionModel.visibility.open();
  };

  const handleMissionCreated = (missionId: string) => {
    router.push(ROUTES.missions.id(missionId));
  };

  return (
    <Layout showHero={false} className="container paper mx-auto my-4">
      <CreateMissionModal model={model.createMissionModel} onSuccess={handleMissionCreated} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="w-64 shrink-0">
            <div className="sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-4">Фільтри</h2>
              <div className="flex flex-col gap-4">
                <Input
                  label="Пошук"
                  value={filters.search || ''}
                  onChange={e => setFilters({ ...filters, search: e.target.value })}
                  searchIcon
                />
                <Select
                  label="Статус"
                  options={statusOptions}
                  value={filters.status || ''}
                  onChange={value =>
                    setFilters({
                      ...filters,
                      status: value ? (value as MissionStatus) : null,
                    })
                  }
                />
                <Select
                  label="Автор"
                  options={model.userModel.options}
                  value={filters.authorId || ''}
                  onChange={value => setFilters({ ...filters, authorId: value || null })}
                />
                <Select
                  label="Карта"
                  multiple={false}
                  options={model.missionModel.islandsOptions}
                  value={filters.islandId || ''}
                  onChange={value => setFilters({ ...filters, islandId: value || null })}
                />
                <NumericInput
                  label="Мін. слотів"
                  placeholder="0"
                  value={filters.minSlots?.toString() || ''}
                  onChange={e =>
                    setFilters({
                      ...filters,
                      minSlots: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
                <NumericInput
                  label="Макс. слотів"
                  placeholder="0"
                  value={filters.maxSlots?.toString() || ''}
                  onChange={e =>
                    setFilters({
                      ...filters,
                      maxSlots: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="outline"
                    disabled={model.missionModel.pagination.preloader.isLoading}
                    onClick={() => {
                      model.missionModel.pagination.init(filters);
                    }}
                    className="w-full">
                    Застосувати
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={model.missionModel.pagination.preloader.isLoading || !isFilterApplied}
                    onClick={() => {
                      setFilters({
                        search: '',
                        status: null,
                        islandId: null,
                        authorId: null,
                        minSlots: null,
                        maxSlots: null,
                      });

                      model.missionModel.pagination.init({
                        skip: 0,
                        take: 25
                      });

                    }}
                    className="w-full">
                    Скинути
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="mb-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-white mb-2">Місії</h1>
              <p className="text-zinc-400">Перегляньте доступні місії та створіть нову</p>
            </div>

            {/* Missions Grid */}
            {model.missionModel.pagination.preloader.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-zinc-400">Завантаження...</div>
              </div>
            ) : (
              <>
                {/* Create Mission Button */}
                <div className="flex mb-4">
                  <Button variant="default" onClick={handleCreateMission}>
                    <PlusIcon className="size-4" />
                    Створити місію
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                  {model.missionModel.pagination.data.map(mission => (
                    <MissionCard key={mission.id} mission={mission} />
                  ))}
                </div>
              </>
            )}

            {model.missionModel.pagination.canLoadMore && (
              <Button variant="outline" className="w-fit mx-auto" onClick={() => model.missionModel.pagination.loadMore()}>
                Показати більше: {model.missionModel.pagination.data.length} з {model.missionModel.pagination.total}
              </Button>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
});

export default MissionsPage;
