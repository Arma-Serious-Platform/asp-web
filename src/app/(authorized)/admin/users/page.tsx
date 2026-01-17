'use client';

import { Input } from '@/shared/ui/atoms/input';
import { AdminSidebar } from '@/widgets/admin/sidebar';
import { Layout } from '@/widgets/layout';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { parseAsString, useQueryStates } from 'nuqs';
import { usersModel } from './model';
import { useDebounce } from 'react-use';
import { DataTable } from '@/shared/ui/organisms/data-table';
import { columns } from './data';
import { BanUnbanUserModal } from '@/features/user/ban-unban-user/ui';
import { ChangeIsReviewerModal } from '@/features/user/change-is-reviewer/ui';

const AdminPage = observer(() => {
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
    usersModel.pagination.init({
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
        <BanUnbanUserModal
          model={usersModel.banUnbanUserModel}
          onBanSuccess={user => {
            usersModel.afterBanUser(user);
          }}
          onUnbanSuccess={user => {
            usersModel.afterUnbanUser(user);
          }}
        />
        <ChangeIsReviewerModal
          model={usersModel.changeIsReviewerModel}
          onSuccess={(userId, isMissionReviewer) => {
            usersModel.afterChangeIsReviewer(userId, isMissionReviewer);
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
          data={usersModel.pagination.data}
          total={usersModel.pagination.total}
          isLoading={usersModel.pagination.preloader.isLoading}
          onLoadMore={() => {
            usersModel.pagination.loadMore();
          }}
        />
      </div>
    </Layout>
  );
});

export default AdminPage;
