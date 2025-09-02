'use client';

import { session } from '@/entities/session/model';
import { ROUTES } from '@/shared/config/routes';
import { observer } from 'mobx-react-lite';
import { redirect } from 'next/navigation';

export default observer(function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = session.user.isAdmin;

  if (!isAdmin) {
    return redirect(ROUTES.home);
  }

  return children;
});
