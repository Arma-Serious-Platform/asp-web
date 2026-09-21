'use client';

import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { AdminSidebar } from '@/app/(authorized)/admin/ui/admin-sidebar';
import { useAdminRouteGuard } from '@/app/(authorized)/admin/state/use-tech-admin-routes-guard';
import { session } from '@/entities/session/session.state';
import { Layout } from '@/widgets/layout';
import { DataTable } from '@/shared/ui/organisms/data-table';
import { Button } from '@/shared/ui/atoms/button';
import { botsPageState } from './state/bots-page.state';
import { columns } from './data';
import { ManageBotsModal } from './ui/manage';

const AdminBotsPage = observer(() => {
  useAdminRouteGuard(session.canAccessBotNotifications);

  useEffect(() => {
    void botsPageState.load();
  }, []);

  const refresh = () => void botsPageState.load();

  return (
    <Layout className="container mx-auto mt-10 flex h-full w-full">
      <div className="paper flex w-full flex-col bg-card p-4">
        <ManageBotsModal
          state={botsPageState.manage}
          onCreateSuccess={refresh}
          onUpdateSuccess={refresh}
          onDeleteSuccess={refresh}
          onSendSuccess={refresh}
        />
        <AdminSidebar className="mb-4" />
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Боти-месенджери</h1>
          {session.canManageBotNotifications && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => botsPageState.manage.modal.open({ mode: 'manage' })}>
              Додати бота
            </Button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={botsPageState.bots}
          total={botsPageState.bots.length}
          isLoading={botsPageState.loader.isLoading}
        />
      </div>
    </Layout>
  );
});

export default AdminBotsPage;
