'use client';

import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { session } from '@/entities/session/session.state';
import { ManageApiKeysModal } from './ui/manage';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { DataTable } from '@/shared/ui/organisms/data-table';
import { Layout } from '@/widgets/layout';
import { AdminSidebar } from '@/app/(authorized)/admin/ui/admin-sidebar';
import { useAdminRouteGuard } from '@/app/(authorized)/admin/state/use-tech-admin-routes-guard';
import { apiKeysPageState } from './state/api-keys-page.state';
import { columns } from './data';

const AdminApiKeysPage = observer(() => {
  useAdminRouteGuard(session.canManageApiKeys);
  const [search, setSearch] = useState('');

  useEffect(() => {
    void apiKeysPageState.load();
  }, []);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return apiKeysPageState.apiKeys;

    return apiKeysPageState.apiKeys.filter(
      key =>
        key.name.toLowerCase().includes(normalizedSearch) ||
        key.keyPrefix.toLowerCase().includes(normalizedSearch),
    );
  }, [search, apiKeysPageState.apiKeys]);

  return (
    <Layout className="container mx-auto mt-10 flex h-full w-full">
      <div className="flex w-full flex-col bg-card p-4 paper">
        <ManageApiKeysModal
          state={apiKeysPageState.manage}
          onCreateSuccess={() => void apiKeysPageState.load()}
          onUpdateSuccess={() => void apiKeysPageState.load()}
          onDeleteSuccess={() => void apiKeysPageState.load()}
        />
        <AdminSidebar className="mb-4" />
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold">API ключі</h1>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => apiKeysPageState.manage.modal.open({ mode: 'manage' })}>
            Створити ключ
          </Button>
        </div>

        <Input
          searchIcon
          autoFocus
          placeholder="Пошук за назвою або префіксом..."
          className="mb-4 max-w-md"
          value={search}
          onChange={event => setSearch(event.target.value)}
        />

        <DataTable
          columns={columns}
          data={filtered}
          total={filtered.length}
          isLoading={apiKeysPageState.loader.isLoading}
        />
      </div>
    </Layout>
  );
});

export default AdminApiKeysPage;
