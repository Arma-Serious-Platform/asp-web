'use client';

import { AdminSidebar } from '@/app/(authorized)/admin/ui/admin-sidebar';
import { Layout } from '@/widgets/layout';
import { ManageIslandModal } from './ui/manage';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { DataTable } from '@/shared/ui/organisms/data-table';
import { observer } from 'mobx-react-lite';
import { parseAsString, useQueryStates } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { columns } from './data';
import { islandsPageState } from './state/islands-page.state';
import { session } from '@/entities/session/session.state';
import { useAdminRouteGuard } from '@/app/(authorized)/admin/state/use-tech-admin-routes-guard';

const AdminIslandsPage = observer(() => {
  useAdminRouteGuard(session.canManageIslands);
  const [search, setSearch] = useState('');
  const [params, setParams] = useQueryStates({
    search: parseAsString.withDefault(''),
  });

  useDebounce(
    () => {
      void setParams({ search: search.trim() });
    },
    200,
    [search],
  );

  useEffect(() => {
    void islandsPageState.pagination.loadAll({ search: params.search || undefined });
  }, [params.search]);

  return (
    <Layout className="container mx-auto mt-10 flex h-full w-full">
      <div className="flex w-full flex-col bg-card p-4">
        <ManageIslandModal
          state={islandsPageState.manageIsland}
          onCreateSuccess={() => void islandsPageState.pagination.refetch()}
          onUpdateSuccess={() => void islandsPageState.pagination.refetch()}
          onDeleteSuccess={() => void islandsPageState.pagination.refetch()}
        />
        <AdminSidebar className="mb-4" />
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Острови</h1>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => islandsPageState.manageIsland.modal.open({ mode: 'manage' })}>
            Додати острів
          </Button>
        </div>

        <Input
          searchIcon
          autoFocus
          placeholder="Пошук за назвою або кодом..."
          className="mb-4 max-w-md"
          value={search}
          onChange={event => setSearch(event.target.value)}
        />

        <DataTable
          columns={columns}
          data={islandsPageState.pagination.data}
          total={islandsPageState.pagination.total}
          isLoading={islandsPageState.pagination.loader.isLoading}
        />
      </div>
    </Layout>
  );
});

export default AdminIslandsPage;
