'use client';

import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { session } from '@/entities/session/model';
import { ManageSpecializationModal } from '@/features/specializations/manage/ui';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { DataTable } from '@/shared/ui/organisms/data-table';
import { Layout } from '@/widgets/layout';
import { AdminSidebar } from '@/widgets/admin/sidebar';
import { useAdminRouteGuard } from '@/widgets/admin/sidebar/hooks/use-tech-admin-routes-guard';
import { adminSpecializationsModel } from './model';
import { columns } from './data';

const AdminSpecializationsPage = observer(() => {
  useAdminRouteGuard(session.canManageSpecializations);
  const [search, setSearch] = useState('');

  useEffect(() => {
    void adminSpecializationsModel.load();
  }, []);

  const filteredSpecializations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return adminSpecializationsModel.specializations;

    return adminSpecializationsModel.specializations.filter(specialization =>
      specialization.name.toLowerCase().includes(normalizedSearch),
    );
  }, [search, adminSpecializationsModel.specializations]);

  return (
    <Layout className="container mx-auto mt-10 flex h-full w-full">
      <div className="flex w-full flex-col bg-card p-4">
        <ManageSpecializationModal
          model={adminSpecializationsModel.manageSpecialization}
          onCreateSuccess={() => void adminSpecializationsModel.load()}
          onUpdateSuccess={() => void adminSpecializationsModel.load()}
          onDeleteSuccess={() => void adminSpecializationsModel.load()}
        />
        <AdminSidebar className="mb-4" />
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Спеціалізації</h1>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => adminSpecializationsModel.manageSpecialization.modal.open({ mode: 'manage' })}>
            Додати спеціалізацію
          </Button>
        </div>

        <Input
          searchIcon
          autoFocus
          placeholder="Пошук за назвою..."
          className="mb-4 max-w-md"
          value={search}
          onChange={event => setSearch(event.target.value)}
        />

        <DataTable
          columns={columns}
          data={filteredSpecializations}
          total={filteredSpecializations.length}
          isLoading={adminSpecializationsModel.loader.isLoading}
        />
      </div>
    </Layout>
  );
});

export default AdminSpecializationsPage;
