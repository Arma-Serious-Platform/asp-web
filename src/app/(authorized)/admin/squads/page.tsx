'use client';

import { session } from '@/entities/session/session.state';
import { useAdminRouteGuard } from '@/app/(authorized)/admin/state/use-tech-admin-routes-guard';
import { AdminSidebar } from '@/app/(authorized)/admin/ui/admin-sidebar';
import { Layout } from '@/widgets/layout';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { squadsPageState } from './state/squads-page.state';

import { DataTable } from '@/shared/ui/organisms/data-table';
import { columns } from './data';

import { Button } from '@/shared/ui/atoms/button';
import { ManageSquadModal } from '@/app/(authorized)/admin/squads/ui/manage-squad';

const AdminPage = observer(() => {
  useAdminRouteGuard(session.canManageSquadsAndSides);

  useEffect(() => {
    squadsPageState.init();
  }, []);

  return (
    <Layout className="flex w-full mt-10 container mx-auto h-full">
      <div className="flex flex-col bg-card w-full p-4 paper">
        <ManageSquadModal
          model={squadsPageState.manageSquad}
          onCreateSuccess={() => {
            squadsPageState.init();
          }}
          onUpdateSuccess={() => {
            squadsPageState.init();
          }}
          onDeleteSuccess={() => {
            squadsPageState.init();
          }}
          existedSquads={squadsPageState.pagination.data.map(squad => squad.data)}
        />
        <AdminSidebar className="mb-4" />
        <div className="mb-2 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Загони</h1>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              squadsPageState.manageSquad.modal.open({
                mode: 'manage',
              });
            }}>
            Додати загін
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={squadsPageState.pagination.data}
          total={squadsPageState.pagination.total}
          isLoading={squadsPageState.pagination.loader.isLoading}
        />
      </div>
    </Layout>
  );
});

export default AdminPage;
