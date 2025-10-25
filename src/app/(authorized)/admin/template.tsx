import { hasAccessToAdminPanel } from '@/entities/user/lib';
import { getCachedUser } from '@/entities/user/server/fetch';
import { ROUTES } from '@/shared/config/routes';

import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCachedUser();

  if (!user) return redirect(ROUTES.auth.login);

  if (!hasAccessToAdminPanel(user?.role)) return redirect(ROUTES.home);

  return children;
}
