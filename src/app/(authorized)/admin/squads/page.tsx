'use client';

import { AdminSidebar } from '@/widgets/admin/sidebar';
import { Layout } from '@/widgets/layout';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { squadsPageModel } from './model';

import { DataTable } from '@/shared/ui/organisms/data-table';
import { columns } from './data';

import { Button } from '@/shared/ui/atoms/button';
import { ManageSquadModal } from '@/features/squads/manage/ui';

const AdminPage = observer(() => {
  useEffect(() => {
    squadsPageModel.squads.init();
  }, []);

  return (
    <Layout className='flex w-full mt-10 container mx-auto h-full'>
      <div className='flex flex-col bg-card w-full p-4'>
        <ManageSquadModal
          model={squadsPageModel.manageSquad}
          onCreateSuccess={() => {
            squadsPageModel.squads.init();
          }}
          onUpdateSuccess={() => {
            squadsPageModel.squads.init();
          }}
          onDeleteSuccess={() => {
            squadsPageModel.squads.init();
          }}
          existedSquads={squadsPageModel.squads.pagination.data}
        />
        <AdminSidebar className='mb-4' />
        <div className='mb-2 flex justify-between items-center'>
          <h1 className='text-2xl font-bold'>Загони</h1>
          <Button
            size='sm'
            variant='secondary'
            onClick={() => {
              squadsPageModel.manageSquad.modal.open({
                mode: 'manage',
              });
            }}>
            Додати загін
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={squadsPageModel.squads.pagination.data}
          total={squadsPageModel.squads.pagination.total}
          isLoading={squadsPageModel.squads.pagination.preloader.isLoading}
        />
      </div>
    </Layout>
  );
});

export default AdminPage;
