'use client';

import { AdminSidebar } from '@/app/(authorized)/admin/ui/admin-sidebar';
import { useAdminRouteGuard } from '@/app/(authorized)/admin/state/use-tech-admin-routes-guard';
import { session } from '@/entities/session/session.state';
import { Layout } from '@/widgets/layout';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';
import { parseAsString, useQueryStates } from 'nuqs';

import { newsPageState } from './state/news-page.state';
import { DataTable } from '@/shared/ui/organisms/data-table';
import { columns } from './data';
import { Button } from '@/shared/ui/atoms/button';
import { ManageNewsModal } from './ui/manage';
import { NewsFilters, NewsFiltersState } from './ui/news-filters';
import { FindNewsDto, NewsType } from '@/shared/sdk/news/news.schemas';

const emptyFilters: NewsFiltersState = {
  authorId: null,
  type: null,
  dateFrom: null,
  dateTo: null,
  published: null,
};

const toNewsListQuery = (params: NewsFiltersState): FindNewsDto => ({
  take: 50,
  skip: 0,
  ...(params.authorId && { authorId: params.authorId }),
  ...(params.type && { type: params.type as NewsType }),
  ...(params.dateFrom && { dateFrom: params.dateFrom }),
  ...(params.dateTo && { dateTo: params.dateTo }),
  ...(params.published === 'true' && { published: true }),
  ...(params.published === 'false' && { published: false }),
});

const AdminNewsPage = observer(() => {
  useAdminRouteGuard(session.canManageNews);

  const [params, setParams] = useQueryStates({
    authorId: parseAsString,
    type: parseAsString,
    dateFrom: parseAsString,
    dateTo: parseAsString,
    published: parseAsString,
  });

  const isFilterApplied = useMemo(
    () =>
      Boolean(params.authorId || params.type || params.dateFrom || params.dateTo || params.published),
    [params],
  );

  useEffect(() => {
    void newsPageState.manageNews.loadAuthors();
  }, []);

  useEffect(() => {
    void newsPageState.pagination.init(toNewsListQuery(params));
  }, [params]);

  const refresh = () => void newsPageState.pagination.init(toNewsListQuery(params));

  return (
    <Layout className="container mx-auto mt-10 flex h-full w-full">
      <div className="paper flex w-full flex-col bg-card p-4">
        <ManageNewsModal
          state={newsPageState.manageNews}
          onCreateSuccess={refresh}
          onUpdateSuccess={refresh}
          onDeleteSuccess={refresh}
        />
        <AdminSidebar className="mb-4" />
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Новини</h1>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => newsPageState.manageNews.modal.open({ mode: 'manage' })}>
            Додати новину
          </Button>
        </div>

        <NewsFilters
          filters={params}
          setFilters={patch => void setParams(patch)}
          onReset={() => void setParams(emptyFilters)}
          isFilterApplied={isFilterApplied}
        />

        <DataTable
          columns={columns}
          data={newsPageState.pagination.data}
          total={newsPageState.pagination.total}
          isLoading={newsPageState.pagination.loader.isLoading}
        />
      </div>
    </Layout>
  );
});

export default AdminNewsPage;
