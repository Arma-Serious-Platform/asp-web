'use client';

import { AdminSidebar } from '@/app/(authorized)/admin/ui/admin-sidebar';
import { Layout } from '@/widgets/layout';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';
import { parseAsArrayOf, parseAsString, useQueryStates } from 'nuqs';

import { weekendsPageState } from './state/weekends-page.state';

import { DataTable } from '@/shared/ui/organisms/data-table';
import { columns } from './data';
import { Button } from '@/shared/ui/atoms/button';
import { ManageWeekendModal } from './ui/manage';
import { WeekendFilters, WeekendFiltersState } from './ui/weekend-filters';
import { FindWeekendsDto } from '@/shared/sdk/types';

const emptyFilters: WeekendFiltersState = {
  missionIds: null,
  hqSquadId: null,
  adminId: null,
  dateFrom: null,
  dateTo: null,
  published: null,
};

const toWeekendListQuery = (params: WeekendFiltersState): FindWeekendsDto => ({
  ...(params.missionIds?.length && { missionIds: params.missionIds }),
  ...(params.hqSquadId && { hqSquadId: params.hqSquadId }),
  ...(params.adminId && { adminId: params.adminId }),
  ...(params.dateFrom && { dateFrom: params.dateFrom }),
  ...(params.dateTo && { dateTo: params.dateTo }),
  ...(params.published === 'true' && { published: true }),
  ...(params.published === 'false' && { published: false }),
});

const AdminPage = observer(() => {
  const [params, setParams] = useQueryStates({
    missionIds: parseAsArrayOf(parseAsString),
    hqSquadId: parseAsString,
    adminId: parseAsString,
    dateFrom: parseAsString,
    dateTo: parseAsString,
    published: parseAsString,
  });

  const isFilterApplied = useMemo(
    () =>
      Boolean(
        params.missionIds?.length ||
          params.hqSquadId ||
          params.adminId ||
          params.dateFrom ||
          params.dateTo ||
          params.published,
      ),
    [params],
  );

  useEffect(() => {
    void weekendsPageState.manageWeekend.init();
  }, []);

  useEffect(() => {
    weekendsPageState.pagination.init(toWeekendListQuery(params));
  }, [params]);

  const refresh = () => weekendsPageState.pagination.init(toWeekendListQuery(params));

  return (
    <Layout className="flex w-full mt-10 container mx-auto h-full">
      <div className="flex flex-col bg-card w-full p-4 paper">
        <ManageWeekendModal
          state={weekendsPageState.manageWeekend}
          onCreateSuccess={refresh}
          onUpdateSuccess={refresh}
          onDeleteSuccess={refresh}
        />
        <AdminSidebar className="mb-4" />
        <div className="mb-2 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Анонси</h1>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => weekendsPageState.manageWeekend.modal.open({ mode: 'manage' })}>
            Додати анонс
          </Button>
        </div>

        <WeekendFilters
          filters={params}
          setFilters={patch => setParams(patch)}
          isFilterApplied={isFilterApplied}
          onReset={() => setParams({ ...emptyFilters })}
        />

        <DataTable
          columns={columns}
          data={weekendsPageState.pagination.data}
          total={weekendsPageState.pagination.total}
          isLoading={weekendsPageState.pagination.loader.isLoading}
        />
      </div>
    </Layout>
  );
});

export default AdminPage;
