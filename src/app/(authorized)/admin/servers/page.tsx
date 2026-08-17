'use client';

import { session } from '@/entities/session/session.state';
import { useAdminRouteGuard } from '@/app/(authorized)/admin/state/use-tech-admin-routes-guard';
import { AdminSidebar } from '@/app/(authorized)/admin/ui/admin-sidebar';
import { Layout } from '@/widgets/layout';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { serversPageState } from './state/servers-page.state';

import { DataTable } from '@/shared/ui/organisms/data-table';
import { columns } from './data';
import { Button } from '@/shared/ui/atoms/button';
import { ManageServerModal } from '@/app/(authorized)/admin/servers/ui/manage-server';

const AdminPage = observer(() => {
  useAdminRouteGuard(session.canManageServers);

  useEffect(() => {
    serversPageState.server.findServers({
      fetchActualInfo: false,
    });
  }, []);

  return (
    <Layout className="flex w-full mt-10 container mx-auto h-full">
      <div className="flex flex-col bg-card w-full p-4 paper">
        <ManageServerModal
          state={serversPageState.manageServer}
          onCreateSuccess={() => {
            serversPageState.server.findServers({
              fetchActualInfo: false,
            });
          }}
          onUpdateSuccess={() => {
            serversPageState.server.findServers({
              fetchActualInfo: false,
            });
          }}
          onDeleteSuccess={() => {
            serversPageState.server.findServers({
              fetchActualInfo: false,
            });
          }}
          existedServers={serversPageState.server.servers}
        />
        <AdminSidebar className="mb-4" />
        <div className="mb-2 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Сервери</h1>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => serversPageState.manageServer.modal.open({ mode: 'manage' })}>
            Додати сервер
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={serversPageState.server.servers}
          total={serversPageState.server.servers.length}
          isLoading={serversPageState.server.loader.isLoading}
        />
      </div>
    </Layout>
  );
});

export default AdminPage;
