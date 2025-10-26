'use client';

import { session } from '@/entities/session/model';
import { env } from '@/shared/config/env';
import { ROUTES } from '@/shared/config/routes';
import { observer } from 'mobx-react-lite';

import { redirect } from 'next/navigation';

export default observer(function AuthTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  if (env.isLanding) {
    return redirect(ROUTES.home);
  }

  if (!session.isAuthorized) return children;

  return redirect(`${ROUTES.user.profile}?tab=profile`);
});
