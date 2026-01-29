'use client';

import { AdminSidebar } from '@/widgets/admin/sidebar';
import { Layout } from '@/widgets/layout';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { weekendsModel } from './model';

import { DataTable } from '@/shared/ui/organisms/data-table';
import { columns } from './data';
import { Button } from '@/shared/ui/atoms/button';
import { ManageWeekendModal } from '@/features/weekends/manage/ui';

const AdminPage = observer(() => {
  useEffect(() => {
    weekendsModel.weekend.pagination.init({});
  }, []);

  const refresh = () => weekendsModel.weekend.pagination.init({});

  return (
    <Layout className="flex w-full mt-10 container mx-auto h-full">
      <div className="flex flex-col bg-card w-full p-4">
        <ManageWeekendModal
          model={weekendsModel.manageWeekend}
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
            onClick={() => weekendsModel.manageWeekend.modal.open({ mode: 'manage' })}>
            Додати анонс
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={weekendsModel.weekend.pagination.data}
          total={weekendsModel.weekend.pagination.total}
          isLoading={weekendsModel.weekend.pagination.preloader.isLoading}
        />
      </div>
    </Layout>
  );
});

export default AdminPage;
