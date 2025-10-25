import { getCachedUser } from '@/entities/user/server/fetch';
import { ROUTES } from '@/shared/config/routes';

import { redirect } from 'next/navigation';

export default async function AuthTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCachedUser();

  if (!user) return redirect(ROUTES.auth.login);

  return children;
}
