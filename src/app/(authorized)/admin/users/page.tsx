'use client';

import { Input } from '@/shared/ui/atoms/input';
import { AdminSidebar } from '@/app/(authorized)/admin/ui/admin-sidebar';
import { Layout } from '@/widgets/layout';
import { session } from '@/entities/session/session.state';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { parseAsString, useQueryStates } from 'nuqs';
import { usersPageState } from './state/users-page.state';
import { useDebounce } from 'react-use';
import { DataTable } from '@/shared/ui/organisms/data-table';
import { columns } from './data';
import { UserAdminActionsModals } from '@/app/(authorized)/admin/users';
import { useAdminRouteGuard } from '@/app/(authorized)/admin/state/use-tech-admin-routes-guard';

const AdminPage = observer(() => {
  useAdminRouteGuard(session.canManageUsers);

  const [search, setSearch] = useState('');
  const [params, setParams] = useQueryStates({
    search: parseAsString.withDefault(''),
  });

  useDebounce(
    () => {
      setParams({ search });
    },
    200,
    [search],
  );

  useEffect(() => {
    usersPageState.pagination.init({
      take: 25,
      skip: 0,
      search: params.search || '',
    });
  }, [params]);

  return (
    <Layout className="flex w-full mt-10 container mx-auto h-full">
      <div className="flex flex-col bg-card w-full p-4">
        <AdminSidebar className="mb-4" />

        <h1 className="text-2xl font-bold mb-2">Гравці</h1>

        <UserAdminActionsModals
          model={usersPageState.adminActions}
          onBanSuccess={user => {
            usersPageState.afterBanUser(user);
          }}
          onUnbanSuccess={user => {
            usersPageState.afterUnbanUser(user);
          }}
          onChangeNicknameSuccess={user => {
            usersPageState.afterChangeNickname(user);
          }}
          onIssueWarningSuccess={warning => {
            usersPageState.afterIssueWarning(warning);
          }}
          onWarningRemoved={warning => {
            usersPageState.afterWarningRemoved(warning);
          }}
          onChangeRoleSuccess={(userId, roles) => {
            usersPageState.afterChangeRole(userId, roles);
          }}
        />

        <Input
          searchIcon
          placeholder="Пошук..."
          className="mb-4"
          autoFocus
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <DataTable
          columns={columns}
          data={usersPageState.pagination.data}
          total={usersPageState.pagination.total}
          isLoading={usersPageState.pagination.loader.isLoading}
          onLoadMore={() => {
            usersPageState.pagination.loadMore();
          }}
        />
      </div>
    </Layout>
  );
});

export default AdminPage;
