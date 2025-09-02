'use client';

import { AdminSidebar } from '@/widgets/admin/sidebar';
import { Layout } from '@/widgets/layout';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { sidesModel } from './model';

import { DataTable } from '@/shared/ui/organisms/data-table';
import { columns } from './data';
import { Button } from '@/shared/ui/atoms/button';
import { ManageServerModal } from '@/features/servers/manage/ui';

const AdminPage = observer(() => {
  useEffect(() => {
    sidesModel.sides.pagination.loadAll();
  }, []);

  return (
    <Layout className='flex w-full mt-10 container mx-auto h-full'>
      <div className='flex flex-col bg-card w-full p-4'>
        <ManageServerModal
          model={sidesModel.manageServer}
          onCreateSuccess={() => {
            sidesModel.sides.pagination.loadAll();
          }}
          onUpdateSuccess={() => {
            sidesModel.sides.pagination.loadAll();
          }}
          onDeleteSuccess={() => {
            sidesModel.sides.pagination.loadAll();
          }}
          // existedServers={sidesModel.sides.pagination.data}
        />
        <AdminSidebar className='mb-4' />
        <div className='mb-2 flex justify-between items-center'>
          <h1 className='text-2xl font-bold'>Сторони</h1>
          {/* <Button
            size='sm'
            variant='secondary'
            onClick={() =>
              sidesModel.manageServer.modal.open({ mode: 'manage' })
            }>
            Додати сторону
          </Button> */}
        </div>

        <DataTable
          columns={columns}
          data={sidesModel.sides.pagination.data}
          total={sidesModel.sides.pagination.total}
          isLoading={sidesModel.sides.pagination.preloader.isLoading}
        />
      </div>
    </Layout>
  );
});

export default AdminPage;
