'use client';

import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { session } from '@/entities/session/session.state';
import { ManageSpecializationModal } from './ui/manage';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { DataTable } from '@/shared/ui/organisms/data-table';
import { Layout } from '@/widgets/layout';
import { AdminSidebar } from '@/app/(authorized)/admin/ui/admin-sidebar';
import { useAdminRouteGuard } from '@/app/(authorized)/admin/state/use-tech-admin-routes-guard';
import { specializationsPageState } from './state/specializations-page.state';
import { columns } from './data';

const AdminSpecializationsPage = observer(() => {
  useAdminRouteGuard(session.canManageSpecializations);
  const [search, setSearch] = useState('');

  useEffect(() => {
    void specializationsPageState.load();
  }, []);

  const filteredSpecializations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return specializationsPageState.specializations;

    return specializationsPageState.specializations.filter(specialization =>
      specialization.name.toLowerCase().includes(normalizedSearch),
    );
  }, [search, specializationsPageState.specializations]);

  return (
    <Layout className="container mx-auto mt-10 flex h-full w-full">
      <div className="flex w-full flex-col bg-card p-4">
        <ManageSpecializationModal
          state={specializationsPageState.manageSpecialization}
          onCreateSuccess={() => void specializationsPageState.load()}
          onUpdateSuccess={() => void specializationsPageState.load()}
          onDeleteSuccess={() => void specializationsPageState.load()}
        />
        <AdminSidebar className="mb-4" />
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Спеціалізації</h1>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => specializationsPageState.manageSpecialization.modal.open({ mode: 'manage' })}>
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
          isLoading={specializationsPageState.loader.isLoading}
        />
      </div>
    </Layout>
  );
});

export default AdminSpecializationsPage;
