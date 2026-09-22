'use client';

import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { session } from '@/entities/session/session.state';
import { ManageAchievementModal } from './ui/manage';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { DataTable } from '@/shared/ui/organisms/data-table';
import { Layout } from '@/widgets/layout';
import { AdminSidebar } from '@/app/(authorized)/admin/ui/admin-sidebar';
import { useAdminRouteGuard } from '@/app/(authorized)/admin/state/use-tech-admin-routes-guard';
import { achievementsPageState } from './state/achievements-page.state';
import { columns } from './data';

const AdminAchievementsPage = observer(() => {
  useAdminRouteGuard(session.canManageAchievements);
  const [search, setSearch] = useState('');

  useEffect(() => {
    void achievementsPageState.load();
  }, []);

  const filteredAchievements = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return achievementsPageState.achievements;

    return achievementsPageState.achievements.filter(
      achievement =>
        achievement.title.toLowerCase().includes(normalizedSearch) ||
        achievement.description.toLowerCase().includes(normalizedSearch),
    );
  }, [search, achievementsPageState.achievements]);

  return (
    <Layout className="container mx-auto mt-10 flex h-full w-full">
      <div className="flex w-full flex-col bg-card p-4 paper">
        <ManageAchievementModal
          state={achievementsPageState.manageAchievement}
          onCreateSuccess={() => void achievementsPageState.load()}
          onUpdateSuccess={() => void achievementsPageState.load()}
          onDeleteSuccess={() => void achievementsPageState.load()}
        />
        <AdminSidebar className="mb-4" />
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Досягнення</h1>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => achievementsPageState.manageAchievement.modal.open({ mode: 'manage' })}>
            Додати досягнення
          </Button>
        </div>

        <Input
          searchIcon
          autoFocus
          placeholder="Пошук за назвою або описом..."
          className="mb-4 max-w-md"
          value={search}
          onChange={event => setSearch(event.target.value)}
        />

        <DataTable
          columns={columns}
          data={filteredAchievements}
          total={filteredAchievements.length}
          isLoading={achievementsPageState.loader.isLoading}
        />
      </div>
    </Layout>
  );
});

export default AdminAchievementsPage;
