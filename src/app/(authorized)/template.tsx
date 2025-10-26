'use client';
import { session } from '@/entities/session/model';
import { ROUTES } from '@/shared/config/routes';
import { observer } from 'mobx-react-lite';

import { redirect } from 'next/navigation';

export default observer(function AuthTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!session.isAuthorized) return redirect(ROUTES.home);

  return children;
});
