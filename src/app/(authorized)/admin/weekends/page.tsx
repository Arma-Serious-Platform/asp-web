'use client';

import { AdminSidebar } from '@/app/(authorized)/admin/ui/admin-sidebar';
import { Layout } from '@/widgets/layout';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { weekendsPageState } from './state/weekends-page.state';

import { DataTable } from '@/shared/ui/organisms/data-table';
import { columns } from './data';
import { Button } from '@/shared/ui/atoms/button';
import { ManageWeekendModal } from './ui/manage';

const AdminPage = observer(() => {
  useEffect(() => {
    weekendsPageState.pagination.init({});
  }, []);

  const refresh = () => weekendsPageState.pagination.init({});

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
