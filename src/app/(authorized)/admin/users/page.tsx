'use client';

import { AdminSidebar } from '@/app/(authorized)/admin/ui/admin-sidebar';
import { Layout } from '@/widgets/layout';
import { session } from '@/entities/session/session.state';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import { parseAsArrayOf, parseAsString, useQueryStates } from 'nuqs';
import { usersPageState } from './state/users-page.state';
import { useDebounce } from 'react-use';
import { DataTable } from '@/shared/ui/organisms/data-table';
import { columns } from './data';
import { UserAdminActionsModals } from '@/app/(authorized)/admin/users';
import { useAdminRouteGuard } from '@/app/(authorized)/admin/state/use-tech-admin-routes-guard';
import { UserFilters, UserFiltersState } from './ui/user-filters';
import { FindUsersDto, UserRole, UserStatus } from '@/shared/sdk/types';

const emptyFilters: UserFiltersState & { search: string } = {
  search: '',
  roles: null,
  status: null,
  warningCount: null,
};

const toUsersListQuery = (
  params: UserFiltersState & { search: string },
): FindUsersDto => {
  const warningCount =
    params.warningCount !== null && params.warningCount !== ''
      ? Number(params.warningCount)
      : undefined;

  return {
    take: 25,
    skip: 0,
    search: params.search || '',
    ...(params.roles?.length && { roles: params.roles as UserRole[] }),
    ...(params.status && { status: params.status as UserStatus }),
    ...(warningCount !== undefined &&
      Number.isFinite(warningCount) && { warningCount }),
  };
};

const AdminPage = observer(() => {
  useAdminRouteGuard(session.canManageUsers);

  const [search, setSearch] = useState('');
  const [params, setParams] = useQueryStates({
    search: parseAsString.withDefault(''),
    roles: parseAsArrayOf(parseAsString),
    status: parseAsString,
    warningCount: parseAsString,
  });

  useDebounce(
    () => {
      setParams({ search });
    },
    200,
    [search],
  );

  useEffect(() => {
    setSearch(params.search || '');
  }, [params.search]);

  const isFilterApplied = useMemo(
    () =>
      Boolean(
        params.search ||
          params.roles?.length ||
          params.status ||
          params.warningCount,
      ),
    [params],
  );

  useEffect(() => {
    usersPageState.pagination.init(toUsersListQuery(params));
  }, [params]);

  return (
    <Layout className="flex w-full mt-10 container mx-auto h-full">
      <div className="flex flex-col bg-card w-full p-4 paper">
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
          onIssueWarningSuccess={response => {
            usersPageState.afterIssueWarning(response);
          }}
          onWarningRemoved={warning => {
            usersPageState.afterWarningRemoved(warning);
          }}
          onChangeRoleSuccess={(userId, roles) => {
            usersPageState.afterChangeRole(userId, roles);
          }}
          onSetUserAchievementsSuccess={(userId, achievements) => {
            usersPageState.afterSetUserAchievements(userId, achievements);
          }}
        />

        <UserFilters
          search={search}
          onSearchChange={setSearch}
          filters={params}
          setFilters={patch => setParams(patch)}
          isFilterApplied={isFilterApplied}
          onReset={() => {
            setSearch('');
            setParams({ ...emptyFilters });
          }}
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
