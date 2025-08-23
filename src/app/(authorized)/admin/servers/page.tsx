'use client';

import { AdminSidebar } from '@/widgets/admin/sidebar';
import { Layout } from '@/widgets/layout';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { serversModel } from './model';

import { DataTable } from '@/shared/ui/organisms/data-table';
import { columns } from './data';
import { Button } from '@/shared/ui/atoms/button';
import { ManageServerModal } from '@/features/servers/manage/ui';

const AdminPage = observer(() => {
  useEffect(() => {
    serversModel.server.findServers({
      fetchActualInfo: false,
    });
  }, []);

  return (
    <Layout className='flex w-full mt-10 container mx-auto h-full'>
      <div className='flex flex-col bg-card w-full p-4'>
        <ManageServerModal
          model={serversModel.manageServer}
          onCreateSuccess={() => {
            serversModel.server.findServers({
              fetchActualInfo: false,
            });
          }}
          onUpdateSuccess={() => {
            serversModel.server.findServers({
              fetchActualInfo: false,
            });
          }}
          onDeleteSuccess={() => {
            serversModel.server.findServers({
              fetchActualInfo: false,
            });
          }}
          existedServers={serversModel.server.servers}
        />
        <AdminSidebar className='mb-4' />
        <div className='mb-2 flex justify-between items-center'>
          <h1 className='text-2xl font-bold'>Сервери</h1>
          <Button
            size='sm'
            variant='secondary'
            onClick={() =>
              serversModel.manageServer.modal.open({ mode: 'manage' })
            }>
            Додати сервер
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={serversModel.server.servers}
          total={serversModel.server.servers.length}
          isLoading={serversModel.server.loader.isLoading}
        />
      </div>
    </Layout>
  );
});

export default AdminPage;
