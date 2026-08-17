'use client';

import { session } from '@/entities/session/session.state';
import { useAdminRouteGuard } from '@/app/(authorized)/admin/state/use-tech-admin-routes-guard';
import { AdminSidebar } from '@/app/(authorized)/admin/ui/admin-sidebar';
import { Layout } from '@/widgets/layout';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { sidesPageState } from './state/sides-page.state';

import { DataTable } from '@/shared/ui/organisms/data-table';
import { columns } from './data';
import { ManageServerModal } from '@/app/(authorized)/admin/servers/ui/manage-server';

const AdminPage = observer(() => {
  useAdminRouteGuard(session.canManageSquadsAndSides);

  useEffect(() => {
    sidesPageState.pagination.loadAll();
  }, []);

  return (
    <Layout className="flex w-full mt-10 container mx-auto h-full">
      <div className="flex flex-col bg-card w-full p-4">
        <ManageServerModal state={sidesPageState.manageServer} />
        <AdminSidebar className="mb-4" />
        <div className="mb-2 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Сторони</h1>
        </div>

        <DataTable
          columns={columns}
          data={sidesPageState.pagination.data}
          total={sidesPageState.pagination.total}
          isLoading={sidesPageState.pagination.loader.isLoading}
        />
      </div>
    </Layout>
  );
});

export default AdminPage;
