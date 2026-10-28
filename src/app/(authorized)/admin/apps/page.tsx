'use client';

import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';

import { session } from '@/entities/session/session.state';
import { getClientDomain } from '@/entities/sso/client-domain';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { DataTable } from '@/shared/ui/organisms/data-table';
import { Layout } from '@/widgets/layout';
import { AdminSidebar } from '@/app/(authorized)/admin/ui/admin-sidebar';
import { useAdminRouteGuard } from '@/app/(authorized)/admin/state/use-tech-admin-routes-guard';
import { appsPageState } from './state/apps-page.state';
import { ManageAppModals } from './ui/manage';
import { columns } from './data';

const AdminAppsPage = observer(() => {
  useAdminRouteGuard(session.canManageSsoClients);
  const [search, setSearch] = useState('');

  useEffect(() => {
    void appsPageState.load();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return appsPageState.apps;

    return appsPageState.apps.filter(
      app =>
        app.name.toLowerCase().includes(query) ||
        app.clientId.toLowerCase().includes(query) ||
        (getClientDomain(app.redirectUris) ?? '').toLowerCase().includes(query),
    );
  }, [search, appsPageState.apps]);

  return (
    <Layout className="container mx-auto mt-10 flex h-full w-full">
      <div className="flex w-full flex-col bg-card p-4 paper">
        <ManageAppModals state={appsPageState.manage} onChange={() => void appsPageState.load()} />
        <AdminSidebar className="mb-4" />
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Додатки</h1>
            <p className="text-sm text-zinc-400">Сайти, які пропонують «Увійти через VTG»</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => appsPageState.manage.modal.open({ mode: 'manage' })}>
            Додати додаток
          </Button>
        </div>

        <Input
          searchIcon
          placeholder="Пошук за назвою, доменом або client ID..."
          className="mb-4 max-w-md"
          value={search}
          onChange={event => setSearch(event.target.value)}
        />

        <DataTable
          columns={columns}
          data={filtered}
          total={filtered.length}
          isLoading={appsPageState.loader.isLoading}
        />
      </div>
    </Layout>
  );
});

export default AdminAppsPage;
