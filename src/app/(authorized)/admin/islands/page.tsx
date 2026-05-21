'use client';

import { AdminSidebar } from '@/widgets/admin/sidebar';
import { Layout } from '@/widgets/layout';
import { ManageIslandModal } from '@/features/islands/manage/ui';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { DataTable } from '@/shared/ui/organisms/data-table';
import { observer } from 'mobx-react-lite';
import { parseAsString, useQueryStates } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { columns } from './data';
import { islandsAdminModel } from './model';
import { session } from '@/entities/session/model';
import { useAdminRouteGuard } from '@/widgets/admin/sidebar/hooks/use-tech-admin-routes-guard';

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
    void islandsAdminModel.islands.pagination.loadAll({ search: params.search || undefined });
  }, [params.search]);

  return (
    <Layout className="container mx-auto mt-10 flex h-full w-full">
      <div className="flex w-full flex-col bg-card p-4">
        <ManageIslandModal
          model={islandsAdminModel.manageIsland}
          onCreateSuccess={() => void islandsAdminModel.islands.pagination.refetch()}
          onUpdateSuccess={() => void islandsAdminModel.islands.pagination.refetch()}
          onDeleteSuccess={() => void islandsAdminModel.islands.pagination.refetch()}
        />
        <AdminSidebar className="mb-4" />
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Острови</h1>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => islandsAdminModel.manageIsland.modal.open({ mode: 'manage' })}>
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
          data={islandsAdminModel.islands.pagination.data}
          total={islandsAdminModel.islands.pagination.total}
          isLoading={islandsAdminModel.islands.pagination.preloader.isLoading}
        />
      </div>
    </Layout>
  );
});

export default AdminIslandsPage;
