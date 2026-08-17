'use client';

import { getFirstAllowedAdminRoute } from '@/app/(authorized)/admin/state/use-tech-admin-routes-guard';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AdminPage = observer(() => {
  const router = useRouter();

  useEffect(() => {
    router.replace(getFirstAllowedAdminRoute());
  }, [router]);

  return null;
});

export default AdminPage;
